// import { Injectable, Inject, OnDestroy } from "@angular/core";
// import { HttpClient, HttpBackend, HttpHeaders } from "@angular/common/http";
// import { HubConnection } from '@microsoft/signalr';
// import * as signalR from '@microsoft/signalr';
// import { Observable } from "rxjs";
// import { map } from "rxjs/operators";
// import { Subject } from "rxjs";
// import { UserService } from '@coreframework/framework';
// import { Member, MemberChanged } from '../models/member.model';
// import { SharedLibConfig } from '../models/shared.config.model';
// import { Meeting } from '../models/meeting.model';
// import { ServerResponceModel } from '../models/server-responce.model';
// import { LoggerService } from '../logger/logger.service';
// import { ServerCommand } from '../models/server-commands.model';
// import { ChangedMembersRespond } from "../models/send-members-tosignalr-answer";

// @Injectable({
//     providedIn: 'root'
// })
// export class SignalRService implements OnDestroy {

//     private baseUrl: string;
//     private functionBaseUrl: string;
//     private hubConnection: HubConnection;
//     private memberStateChangedSource: Subject<Member[]> = new Subject<Member[]>();
//     private membersStateChangedSource: Subject<Member[]> = new Subject<Member[]>();
//     private meetingStateChangedSource: Subject<Meeting> = new Subject<Meeting>();
//     private commandFromTheServerSource: Subject<ServerCommand> = new Subject<ServerCommand>();
//     memberStateChanged$: Observable<Member[]> = this.memberStateChangedSource.asObservable();
//     membersStateChanged$: Observable<Member[]> = this.membersStateChangedSource.asObservable();
//     meetingStateChanged$: Observable<Meeting> = this.meetingStateChangedSource.asObservable();
//     commandFromTheServer$: Observable<ServerCommand> = this.commandFromTheServerSource.asObservable();
//     private meetingsTimestamp: Array<number> = [];
//     private membersTimestamp: Array<number> = [];
//     private httpClient: HttpClient;
//     private intervalDescriptor: any;
//     private initialized = false;
//     private isIntializing = false;
//     private userEmail: string;
//     private attemptNumberToInit = 15;

//     constructor(@Inject('sharedLibConfig') private config: SharedLibConfig,
//                 private httpBackend: HttpBackend,
//                 private userSvc: UserService,
//                 private loggerSvc: LoggerService,
//                 httpInjectedClient: HttpClient) {
//         if (this.config.isFuncAuth) {
//             this.httpClient = httpInjectedClient;
//         } else {
//             this.httpClient = new HttpClient(httpBackend);
//         }
//         this.baseUrl = config.signalrBaseUrl;
//         this.functionBaseUrl = config.azureFunctionBaseUrl;
//         let attemptCounter = 0;
//         this.intervalDescriptor = setInterval(() => {
//             attemptCounter = attemptCounter + 1;
//             if (attemptCounter > this.attemptNumberToInit) {
//                 clearInterval(this.intervalDescriptor);
//                 this.intervalDescriptor = null;
//                 this.loggerSvc.error("could not initialize signalr service");
//                 return;
//             }
//             const isUserLoggedIn = !!this.userSvc.getLoggedUserEmail();
//             if (!this.initialized && !this.isIntializing && isUserLoggedIn) {
//                 this.initMeetingsHub();
//                 this.userEmail = this.userSvc.getLoggedUserEmail();
//             } else if (this.initialized) {
//                 clearInterval(this.intervalDescriptor);
//                 this.intervalDescriptor = null;
//             }
//         }, 1500);
//     }

//     ngOnDestroy() {
//         if (this.intervalDescriptor) {
//             clearInterval(this.intervalDescriptor);
//         }
//     }

//     private getConnectionInfo(path: string): Observable<any> {
//         const requestUrl = `${this.baseUrl}${path}`;
//         if (this.config.isFuncAuth) {
//             return this.httpClient.get<SignalRConnectionInfo>(requestUrl);
//         } else {
//             const reqHeader = new HttpHeaders({
//                 'Content-Type': 'application/json',
//                 Authorization: 'Bearer ' + localStorage.getItem(`adal.access.token.key${this.config.clientId}`)
//             });
//             return this.httpClient.get<SignalRConnectionInfo>(requestUrl, {
//                 headers: reqHeader
//             });
//         }
//     }

//     initMeetingsHub() {
//         this.loggerSvc.info(`initializing SignalRService...`);
//         this.isIntializing = true;
//         this.getConnectionInfo('negotiate-meetings').subscribe(info => {
//             this.initialized = true;
//             this.isIntializing = false;
//             this.loggerSvc.info(`received info for endpoint ${info.url}`);
//             const options = {
//                 accessTokenFactory: () => info.accessToken
//             };
//             this.hubConnection = new signalR.HubConnectionBuilder()
//                 .withUrl(info.url, options)
//                 .withAutomaticReconnect()
//                 .configureLogging(signalR.LogLevel.Information)
//                 .build();

//             this.hubConnection.start().catch(err => {
//                 this.loggerSvc.error(`START ERROR error during start - ${this.hubConnection.state} with error - ${err}`);
//             });

//             this.hubConnection.onreconnecting(error => {
//                 this.loggerSvc.error(`ON RECONNECTIONG - ${this.hubConnection.state} with error - ${error}`);
//             });

//             this.hubConnection.onreconnected(error => {
//                 this.loggerSvc.error(`state - ${this.hubConnection.state} with error - ${error}`);
//             });

            
//             this.hubConnection.onclose(error => {
//                 this.hubConnection.start().catch(err => {
//                     console.error(err.toString());
//                 });
//                 this.loggerSvc.error(`state - ${this.hubConnection.state} with error - ${error}`);
//             });

//             this.hubConnection.on('memberStateChanged', (data: any) => {
//                 let membersToRecieve = [];
//                 if (this.membersTimestamp.length > 0) {
//                     membersToRecieve = (data as Array<Member>).filter(x => this.membersTimestamp.indexOf(x.timeStamp) === -1);
//                 } else {
//                     membersToRecieve = data;
//                 }
//                 if (membersToRecieve?.length > 0) {
//                     const timeStamp = new Date().toISOString();
//                     for (const x of membersToRecieve) {
//                         this.loggerSvc.logPerfomanceMember(
//                             "PRFM from boardroomui",
//                             "initMeetingsHub", 
//                             "1 memberStateChanged signalr event handler", 
//                             x, 
//                             this.userEmail, 
//                             undefined, 
//                             x.transactionStTime);
//                     }
//                     this.memberStateChangedSource.next(membersToRecieve);
//                 }
//             });

//             this.hubConnection.on('membersStateChanged', (data: any) => {
//                 let membersToRecieve = [];
//                 if (this.membersTimestamp.length > 0) {
//                     membersToRecieve = (data as Array<Member>).filter(x => this.membersTimestamp.indexOf(x.timeStamp) === -1);
//                 } else {
//                     membersToRecieve = data;
//                 }
//                 if (membersToRecieve?.length > 0) {
//                     const timeStamp = new Date().toISOString();
//                     for (const x of membersToRecieve) {
//                         this.loggerSvc.logPerfomanceMember(
//                             "PRFM from boardroomui",
//                             "initMeetingsHub", 
//                             "2 membersStateChanged signalr event handler", 
//                             x, 
//                             this.userEmail, 
//                             undefined, 
//                             x.transactionStTime);
//                     }
//                     this.membersStateChangedSource.next(membersToRecieve);
//                 }
//             });

//             this.hubConnection.on('webexServerCommand', (data: any) => {
//                 this.loggerSvc.info(`get webex server command - ${JSON.stringify(data)}`);
//                 this.commandFromTheServerSource.next(data);
//             });

//             this.hubConnection.on('error', (err: any) => {
//                 this.loggerSvc.error(`ON_ERROR state - ${this.hubConnection.state} with error - ${err}`);
//             });
//             this.hubConnection.on('meetingStateChanged', (data: any) => {
//                 if (this.meetingsTimestamp.length === 0 || this.meetingsTimestamp.indexOf(data.timeStamp) === -1) {
//                     this.meetingStateChangedSource.next(data);
//                 }
//             });
//         }, error => {
//             this.isIntializing = false;
//             this.loggerSvc.error(error);
//         });
//     }

//     sendChangedMember(members: Member[], timestamp: number): Observable<any> {
//         if (this.membersTimestamp.length > 10) {
//             this.membersTimestamp = [ timestamp ];
//         } else {
//             this.membersTimestamp.push(timestamp);
//         }
//         members.forEach(x => { 
//             x.timeStamp = timestamp;
//             this.loggerSvc.logPerfomanceMember(
//                 "PRFM from boardroomui",
//                 "sendChangedMember", 
//                 "", 
//                 x, 
//                 undefined, 
//                 this.userEmail,
//                 undefined,
//                 x.transactionStTime); 
//         });
//         const requestUrl = `${this.baseUrl}member-state-changed`;
//         if (this.config.isFuncAuth) {
//             return this.httpClient.post(requestUrl, members);
//         } else {
//             const reqHeader = new HttpHeaders({
//                 'Content-Type': 'application/json',
//                 Authorization: 'Bearer ' + localStorage.getItem(`adal.access.token.key${this.config.clientId}`)
//             });
//             return this.httpClient.post(requestUrl, members, {
//                 headers: reqHeader
//             });
//         }
//     }

//     sendChangedMembers2(members: Member[], timestamp: number): Observable<ChangedMembersRespond> {
//         if (this.membersTimestamp.length > 10) {
//             this.membersTimestamp = [ timestamp ];
//         } else {
//             this.membersTimestamp.push(timestamp);
//         }
//         members.forEach(x => { 
//             x.timeStamp = timestamp;
//             this.loggerSvc.logPerfomanceMember(
//                 "PRFM from boardroomui",
//                 "sendChangedMembers2", 
//                 "", 
//                 x, 
//                 undefined, 
//                 this.userEmail,
//                 undefined,
//                 x.transactionStTime); 
//         });
//         const requestUrl = `${this.baseUrl}members-state-changed2`;
//         if (this.config.isFuncAuth) {
//             return this.httpClient.post<ChangedMembersRespond>(requestUrl, members);
//         } else {
//             const reqHeader = new HttpHeaders({
//                 'Content-Type': 'application/json',
//                 Authorization: 'Bearer ' + localStorage.getItem(`adal.access.token.key${this.config.clientId}`)
//             });
//             return this.httpClient.post<ChangedMembersRespond>(requestUrl, members, {
//                 headers: reqHeader
//             });
//         }
//     }

//     sendChangedMeeting(meeting: Meeting, timestamp: number): Observable<ServerResponceModel> {
//         meeting.timeStamp = timestamp;
//         if (this.meetingsTimestamp.length > 10) {
//             this.meetingsTimestamp = [ timestamp ];
//         } else {
//             this.meetingsTimestamp.push(timestamp);
//         }
//         const requestUrl = `${this.baseUrl}meeting-state-changed`;
//         if (this.config.isFuncAuth) {
//             return this.httpClient.post<ServerResponceModel>(requestUrl, meeting);
//         } else {
//             const reqHeader = new HttpHeaders({
//                 'Content-Type': 'application/json',
//                 Authorization: 'Bearer ' + localStorage.getItem(`adal.access.token.key${this.config.clientId}`)
//             });
//             return this.httpClient.post<ServerResponceModel>(requestUrl, meeting, {
//                 headers: reqHeader
//             });
//         }
//     }

//     getQuorumDetail(meeting: Meeting): Observable<any> {
//         const requestUrl = `${this.functionBaseUrl}QuorumCalculation`;
//         const data = { MeetingID: meeting.id };
//         if (this.config.isFuncAuth) {
//             return this.httpClient.post(requestUrl, data);
//         } else {
//             const reqHeader = new HttpHeaders({
//                 'Content-Type': 'application/json',
//                 Authorization: 'Bearer ' + localStorage.getItem(`adal.access.token.key${this.config.clientId}`)
//             });
//             return this.httpClient.post(requestUrl, data, {
//                 headers: reqHeader
//             });
//         }
//     }
// }

// interface SignalRConnectionInfo {
//     url: string;
//     accessToken: string;
// }
// import { Injectable, Inject, OnDestroy } from "@angular/core";
// import { HttpClient, HttpBackend, HttpHeaders } from "@angular/common/http";
// import { HubConnection } from '@microsoft/signalr';
// import * as signalR from '@microsoft/signalr';
// import { Observable } from "rxjs";
// import { map } from "rxjs/operators";
// import { Subject } from "rxjs";
// import { UserService } from '@coreframework/framework';
// import { Member, MemberChanged } from '../models/member.model';
// import { SharedLibConfig } from '../models/shared.config.model';
// import { Meeting } from '../models/meeting.model';
// import { ServerResponceModel } from '../models/server-responce.model';
// import { LoggerService } from '../logger/logger.service';
// import { ServerCommand } from '../models/server-commands.model';
// import { ChangedMembersRespond } from "../models/send-members-tosignalr-answer";

// @Injectable({
//     providedIn: 'root'
// })
// export class SignalRService implements OnDestroy {

//     private baseUrl: string;
//     private functionBaseUrl: string;
//     private hubConnection: HubConnection;
//     private memberStateChangedSource: Subject<Member[]> = new Subject<Member[]>();
//     private membersStateChangedSource: Subject<Member[]> = new Subject<Member[]>();
//     private meetingStateChangedSource: Subject<Meeting> = new Subject<Meeting>();
//     private commandFromTheServerSource: Subject<ServerCommand> = new Subject<ServerCommand>();
//     memberStateChanged$: Observable<Member[]> = this.memberStateChangedSource.asObservable();
//     membersStateChanged$: Observable<Member[]> = this.membersStateChangedSource.asObservable();
//     meetingStateChanged$: Observable<Meeting> = this.meetingStateChangedSource.asObservable();
//     commandFromTheServer$: Observable<ServerCommand> = this.commandFromTheServerSource.asObservable();
//     private meetingsTimestamp: Array<number> = [];
//     private membersTimestamp: Array<number> = [];
//     private httpClient: HttpClient;
//     private intervalDescriptor: any;
//     private initialized = false;
//     private isIntializing = false;
//     private userEmail: string;
//     private attemptNumberToInit = 15;

//     constructor(@Inject('sharedLibConfig') private config: SharedLibConfig,
//                 private httpBackend: HttpBackend,
//                 private userSvc: UserService,
//                 private loggerSvc: LoggerService,
//                 httpInjectedClient: HttpClient) {
//         if (this.config.isFuncAuth) {
//             this.httpClient = httpInjectedClient;
//         } else {
//             this.httpClient = new HttpClient(httpBackend);
//         }
//         this.baseUrl = config.signalrBaseUrl;
//         this.functionBaseUrl = config.azureFunctionBaseUrl;
//         let attemptCounter = 0;
//         this.intervalDescriptor = setInterval(() => {
//             attemptCounter = attemptCounter + 1;
//             if (attemptCounter > this.attemptNumberToInit) {
//                 clearInterval(this.intervalDescriptor);
//                 this.intervalDescriptor = null;
//                 this.loggerSvc.error("could not initialize signalr service");
//                 return;
//             }
//             const isUserLoggedIn = !!this.userSvc.getLoggedUserEmail();
//             if (!this.initialized && !this.isIntializing && isUserLoggedIn) {
//                 this.initMeetingsHub();
//                 this.userEmail = this.userSvc.getLoggedUserEmail();
//             } else if (this.initialized) {
//                 clearInterval(this.intervalDescriptor);
//                 this.intervalDescriptor = null;
//             }
//         }, 1500);
//     }

//     ngOnDestroy() {
//         if (this.intervalDescriptor) {
//             clearInterval(this.intervalDescriptor);
//         }
//     }

//     private getConnectionInfo(path: string): Observable<any> {
//         const requestUrl = `${this.baseUrl}${path}`;
//         if (this.config.isFuncAuth) {
//             return this.httpClient.get<SignalRConnectionInfo>(requestUrl);
//         } else {
//             const reqHeader = new HttpHeaders({
//                 'Content-Type': 'application/json',
//                 Authorization: 'Bearer ' + localStorage.getItem(`adal.access.token.key${this.config.clientId}`)
//             });
//             return this.httpClient.get<SignalRConnectionInfo>(requestUrl, {
//                 headers: reqHeader
//             });
//         }
//     }

//     initMeetingsHub() {
//         this.loggerSvc.info(`initializing SignalRService...`);
//         this.isIntializing = true;
//         this.getConnectionInfo('negotiate-meetings').subscribe(info => {
//             this.initialized = true;
//             this.isIntializing = false;
//             this.loggerSvc.info(`received info for endpoint ${info.url}`);
//             const options = {
//                 accessTokenFactory: () => info.accessToken
//             };
//             this.hubConnection = new signalR.HubConnectionBuilder()
//                 .withUrl(info.url, options)
//                 .withAutomaticReconnect()
//                 .configureLogging(signalR.LogLevel.Information)
//                 .build();

//             this.hubConnection.start().catch(err => {
//                 this.loggerSvc.error(`START ERROR error during start - ${this.hubConnection.state} with error - ${err}`);
//             });

//             this.hubConnection.onreconnecting(error => {
//                 this.loggerSvc.error(`ON RECONNECTIONG - ${this.hubConnection.state} with error - ${error}`);
//             });

//             this.hubConnection.onreconnected(error => {
//                 this.loggerSvc.error(`state - ${this.hubConnection.state} with error - ${error}`);
//             });

            
//             this.hubConnection.onclose(error => {
//                 this.hubConnection.start().catch(err => {
//                     console.error(err.toString());
//                 });
//                 this.loggerSvc.error(`state - ${this.hubConnection.state} with error - ${error}`);
//             });

//             this.hubConnection.on('memberStateChanged', (data: any) => {
//                 let membersToRecieve = [];
//                 if (this.membersTimestamp.length > 0) {
//                     membersToRecieve = (data as Array<Member>).filter(x => this.membersTimestamp.indexOf(x.timeStamp) === -1);
//                 } else {
//                     membersToRecieve = data;
//                 }
//                 if (membersToRecieve?.length > 0) {
//                     const timeStamp = new Date().toISOString();
//                     for (const x of membersToRecieve) {
//                         this.loggerSvc.logPerfomanceMember(
//                             "PRFM from boardroomui",
//                             "initMeetingsHub", 
//                             "1 memberStateChanged signalr event handler", 
//                             x, 
//                             this.userEmail, 
//                             undefined, 
//                             x.transactionStTime);
//                     }
//                     this.memberStateChangedSource.next(membersToRecieve);
//                 }
//             });

//             this.hubConnection.on('membersStateChanged', (data: any) => {
//                 let membersToRecieve = [];
//                 if (this.membersTimestamp.length > 0) {
//                     membersToRecieve = (data as