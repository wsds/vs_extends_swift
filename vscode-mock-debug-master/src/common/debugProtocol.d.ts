/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

/** Declaration module describing the VS Code debug protocol
 */
declare module DebugProtocol {

	//---- V8 inspired protocol

	/** Base class of V8 requests, responses, and events. */
	export interface V8Message {
		/** Sequence number */
		seq: number;
		/** One of "request", "response", or "event" */
		type: string;
	}

	/** Client-initiated request */
	export interface Request extends V8Message {
		/** The command to execute */
		command: string;
		/** Object containing arguments for the command */
		arguments?: any;
	}

	/** Server-initiated event */
	export interface Event extends V8Message {
		/** Type of event */
		event: string;
		/** Event-specific information */
		body?: any;
	}

	/** Server-initiated response to client request */
	export interface Response extends V8Message {
		/** Sequence number of the corresponding request */
		request_seq: number;
		/** Outcome of the request */
		success: boolean;
		/** The command requested */
		command: string;
		/** Contains error message if success == false. */
		message?: string;
		/** Contains request result if success is true and optional error details if success is false. */
		body?: any;
	}

	//---- Events

	/** Event message for "initialized" event type.
		The event indicates that the debugee is ready to accept SetBreakpoint calls.
	*/
	export interface InitializedEvent extends Event {
	}

	/** Event message for "stopped" event type.
		The event indicates that the execution of the debugee has stopped due to a break condition.
		This can be caused by by a break point previously set, a stepping action has completed or by executing a debugger statement.
    */
	export interface StoppedEvent extends Event {
		body: {
			/** The reason for the event (such as: 'step', 'breakpoint', 'exception', 'pause') */
			reason: string;
			/** The thread which was stopped. */
			threadId?: number;
			/** Additonal information. E.g. if reason is 'exception', text contains the exception name. */
			text?: string;
		};
	}

	/** Event message for "exited" event type.
		The event indicates that the debugee has exited.
	*/
	export interface ExitedEvent extends Event {
		body: {
			/** The exit code returned from the debuggee. */
			exitCode: number;
		};
	}

	/** Event message for "terminated" event types.
		The event indicates that debugging of the debuggee has terminated.
	*/
	export interface TerminatedEvent extends Event {
	}

	/** Event message for "thread" event type.
		The event indicates that a thread has started or exited.
	*/
	export interface ThreadEvent extends Event {
		body: {
			/** The reason for the event (such as: 'started', 'exited'). */
			reason: string;
			/** The identifier of the thread. */
			threadId: number;
		};
	}

	/** Event message for "output" event type.
		The event indicates that the target has produced output.
	*/
	export interface OutputEvent extends Event {
		body: {
			/** The category of output (such as: 'console', 'stdout', 'stderr'). If not specified, 'console' is assumed. */
			category?: string;
			/** The output */
			output: string;
		};
	}

	//---- Requests

	/** On error that is whenever 'success' is false, the body can provide more details.
	 */
	export interface ErrorResponse extends Response {
		body: {
			/** An optional, structured error message. */
			error?: Message
		}
	}

	/** Initialize request; value of command field is "initialize".
	*/
	export interface InitializeRequest extends Request {
		arguments: InitializeRequestArguments;
	}
	/** Arguments for "initialize" request. */
	export interface InitializeRequestArguments {
		/** The ID of the debugger adapter. Used to select or verify debugger adapter. */
		adapterID: string;
		/** If true all line numbers are 1-based (default). */
		linesStartAt1?: boolean;
		/** If true all column numbers are 1-based (default). */
		columnsStartAt1?: boolean;
		/** Determines in what format paths are specified. Possible values are 'path' or 'uri'. The default is 'path', which is the native format. */
		pathFormat?: string;
	}
	/** Response to Initialize request. */
	export interface InitializeResponse extends Response {
	}

	/** Launch request; value of command field is "launch".
	*/
	export interface LaunchRequest extends Request {
		arguments: LaunchRequestArguments;
	}
	/** Arguments for "launch" request. */
	export interface LaunchRequestArguments {
		/* The launch request has no standardized attributes. */
	}
	/** Response to "launch" request. This is just an acknowledgement, so no body field is required. */
	export interface LaunchResponse extends Response {
	}

	/** Attach request; value of command field is "attach".
	*/
	export interface AttachRequest extends Request {
		arguments: AttachRequestArguments;
	}
	/** Arguments for "attach" request. */
	export interface AttachRequestArguments {
		/* The attach request has no standardized attributes. */
	}
	/** Response to "attach" request. This is just an acknowledgement, so no body field is required. */
	export interface AttachResponse extends Response {
	}

	/** Disconnect request; value of command field is "disconnect".
	*/
	export interface DisconnectRequest extends Request {
		arguments?: DisconnectArguments;
	}
	/** Arguments for "disconnect" request. */
	export interface DisconnectArguments {
	}
	/** Response to "disconnect" request. This is just an acknowledgement, so no body field is required. */
	export interface DisconnectResponse extends Response {
	}

	/** SetBreakpoints request; value of command field is "setBreakpoints".
		Sets multiple breakpoints for a single source and clears all previous breakpoints in that source.
		To clear all breakpoint for a source, specify an empty array.
		When a breakpoint is hit, a StoppedEvent (event type 'breakpoint') is generated.
	*/
	export interface SetBreakpointsRequest extends Request {
		arguments: SetBreakpointsArguments;
	}
	/** Arguments for "setBreakpoints" request. */
	export interface SetBreakpointsArguments {
		/** The source location of the breakpoints; either source.path or source.reference must be specified. */
		source: Source;
		/** The code locations of the breakpoints */
		lines: number[];
	}
	/** Response to "setBreakpoints" request.
		Returned is information about each breakpoint created by this request.
		This includes the actual code location and whether the breakpoint could be verified.
	*/
	export interface SetBreakpointsResponse extends Response {
		body: {
			/** Information about the breakpoints. The array elements correspond to the elements of the 'lines' array. */
			breakpoints: Breakpoint[];
		};
	}

	/** SetExceptionBreakpoints request; value of command field is "setExceptionBreakpoints".
		Enable that the debuggee stops on exceptions with a StoppedEvent (event type 'exception').
	*/
	export interface SetExceptionBreakpointsRequest extends Request {
		arguments: SetExceptionBreakpointsArguments;
	}
	/** Arguments for "setExceptionBreakpoints" request. */
	export interface SetExceptionBreakpointsArguments {
		/** Names of enabled exception breakpoints. */
		filters: string[];
	}
	/** Response to "setExceptionBreakpoints" request. This is just an acknowledgement, so no body field is required. */
	export interface SetExceptionBreakpointsResponse extends Response {
	}

	/** Continue request; value of command field is "continue".
		The request starts the debuggee to run again.
	*/
	export interface ContinueRequest extends Request {
		arguments: ContinueArguments;
	}
	/** Arguments for "continue" request. */
	export interface ContinueArguments {
		/** continue execution for this thread. */
		threadId: number;
	}
	/** Response to "continue" request. This is just an acknowledgement, so no body field is required. */
	export interface ContinueResponse extends Response {
	}

	/** Next request; value of command field is "next".
		The request starts the debuggee to run again for one step.
		penDebug will respond with a StoppedEvent (event type 'step') after running the step.
	*/
	export interface NextRequest extends Request {
		arguments: NextArguments;
	}
	/** Arguments for "next" request. */
	export interface NextArguments {
		/** Continue execution for this thread. */
		threadId: number;
	}
	/** Response to "next" request. This is just an acknowledgement, so no body field is required. */
	export interface NextResponse extends Response {
	}

	/** StepIn request; value of command field is "stepIn".
		The request starts the debuggee to run again for one step.
		The debug adapter will respond with a StoppedEvent (event type 'step') after running the step.
	*/
	export interface StepInRequest extends Request {
		arguments: StepInArguments;
	}
	/** Arguments for "stepIn" request. */
	export interface StepInArguments {
		/** Continue execution for this thread. */
		threadId: number;
	}
	/** Response to "stepIn" request. This is just an acknowledgement, so no body field is required. */
	export interface StepInResponse extends Response {
	}

	/** StepOutIn request; value of command field is "stepOut".
		The request starts the debuggee to run again for one step.
		penDebug will respond with a StoppedEvent (event type 'step') after running the step.
	*/
	export interface StepOutRequest extends Request {
		arguments: StepOutArguments;
	}
	/** Arguments for "stepOut" request. */
	export interface StepOutArguments {
		/** Continue execution for this thread. */
		threadId: number;
	}
	/** Response to "stepOut" request. This is just an acknowledgement, so no body field is required. */
	export interface StepOutResponse extends Response {
	}

	/** Pause request; value of command field is "pause".
		The request suspenses the debuggee.
		penDebug will respond with a StoppedEvent (event type 'pause') after a successful 'pause' command.
	*/
	export interface PauseRequest extends Request {
		arguments: PauseArguments;
	}
	/** Arguments for "pause" request. */
	export interface PauseArguments {
		/** Pause execution for this thread. */
		threadId: number;
	}
	/** Response to "pause" request. This is just an acknowledgement, so no body field is required. */
	export interface PauseResponse extends Response {
	}

	/** StackTrace request; value of command field is "stackTrace".
		The request returns a stacktrace from the current execution state.
	*/
	export interface StackTraceRequest extends Request {
		arguments: StackTraceArguments;
	}
	/** Arguments for "stackTrace" request. */
	export interface StackTraceArguments {
		/** Retrieve the stacktrace for this thread. */
		threadId: number;
		/** The maximum number of frames to return. If levels is not specified or 0, all frames are returned. */
		levels?: number;
	}
	/** Response to "stackTrace" request. */
	export interface StackTraceResponse extends Response {
		body: {
			/** The frames of the stackframe. If the array has length zero, there are no stackframes available.
				This means that there is no location information available. */
			stackFrames: StackFrame[];
		};
    }

	/** Scopes request; value of command field is "scopes".
		The request returns the variable scopes for a given stackframe ID.
	*/
	export interface ScopesRequest extends Request {
		arguments: ScopesArguments;
	}
	/** Arguments for "scopes" request. */
	export interface ScopesArguments {
		/** Retrieve the scopes for this stackframe. */
		frameId: number;
	}
	/** Response to "scopes" request. */
	export interface ScopesResponse extends Response {
		body: {
			/** The scopes of the stackframe. If the array has length zero, there are no scopes available. */
			scopes: Scope[];
		};
    }

	/** Variables request; value of command field is "variables".
		Retrieves all children for the given variable reference.
	*/
	export interface VariablesRequest extends Request {
		arguments: VariablesArguments;
	}
	/** Arguments for "variables" request. */
	export interface VariablesArguments {
		/** The Variable reference. */
		variablesReference: number;
	}
	/** Response to "variables" request. */
	export interface VariablesResponse extends Response {
		body: {
			/** All children for the given variable reference */
			variables: Variable[];
		};
	}

	/** Source request; value of command field is "source".
		The request retrieves the source code for a given source reference.
	*/
	export interface SourceRequest extends Request {
		arguments: SourceArguments;
	}
	/** Arguments for "source" request. */
	export interface SourceArguments {
		/** The reference to the source. This is the value received in Source.reference. */
		sourceReference: number;
	}
	/** Response to "source" request. */
	export interface SourceResponse extends Response {
		body: {
			/** Content of the source reference */
			content: string;
		};
	}

	/** Thread request; value of command field is "threads".
		The request retrieves a list of all threads.
	*/
	export interface ThreadsRequest extends Request {
	}
	/** Response to "threads" request. */
	export interface ThreadsResponse extends Response {
		body: {
			/** All threads. */
			threads: Thread[];
		};
    }

	/** Evaluate request; value of command field is "evaluate".
		Evaluates the given expression in the context of the top most stack frame.
		The expression has access to any variables and arguments that are in scope.
	*/
	export interface EvaluateRequest extends Request {
		arguments: EvaluateArguments;
    }
	/** Arguments for "evaluate" request. */
	export interface EvaluateArguments {
		/** The expression to evaluate */
		expression: string;
		/** Evaluate the expression in the context of this stack frame. If not specified, the expression is evaluated in the global context. */
		frameId?: number;
	}
	/** Response to "evaluate" request. */
	export interface EvaluateResponse extends Response {
		body: {
			/** The result of the evaluate. */
			result: string;
			/** If variablesReference is > 0, the evaluate result is structured and its children can be retrieved by passing variablesReference to the VariablesRequest */
			variablesReference: number;
		};
	}

	//---- Types

	/** A structured message object. Used to return errors from requests. */
	export interface Message {
		/** Unique identifier for the message. */
		id: number;
		/** A format string for the message. Embedded variables have the form '{name}'.
		    If variable name starts with an underscore character, the variable does not contain user data (PII) and can be safely used for telemetry purposes. */
		format: string;
		/** An object used as a dictionary for looking up the variables in the format string. */
		variables?: { [key: string]: string };
		/** if true send to telemetry (Experimental) */
		sendTelemetry?: boolean;
		/** if true show user (Experimental) */
		showUser?: boolean;
	}

	/** A Thread */
	export interface Thread {
		/** Unique identifier for the thread. */
		id: number;
		/** A name of the thread. */
		name: string;
	}

	/** A Source .*/
	export interface Source {
		/** The short name of the source. Every source returned from the debug adapter has a name. When specifying a source to the debug adapter this name is optional. */
		name?: string;
		/** The long (absolute) path of the source. It is not guaranteed that the source exists at this location. */
		path?: string;
		/** If sourceReference > 0 the contents of the source can be retrieved through the SourceRequest. A sourceReference is only valid for a session, so it must not be used to persist a source. */
		sourceReference?: number;
	}

	/** A Stackframe contains the source location. */
	export interface StackFrame {
		/** An identifier for the stack frame. This id can be used to retrieve the scopes of the frame with the 'scopesRequest'. */
		id: number;
		/** The name of the stack frame, typically a method name */
		name: string;
		/** The optional source of the frame. */
		source?: Source;
		/** The line within the file of the frame. If source is null or doesn't exist, line is 0 and must be ignored. */
		line: number;
		/** The column within the line. If source is null or doesn't exist, column is 0 and must be ignored. */
		column: number;
	}

	/** A Scope is a named container for variables. */
	export interface Scope {
		/** name of the scope (as such 'Arguments', 'Locals') */
		name: string;
		/** The variables of this scope can be retrieved by passing the value of variablesReference to the VariablesRequest. */
		variablesReference: number;
		/** If true, the number of variables in this scope is large or expensive to retrieve. */
		expensive: boolean;
	}

	/** A Variable is a name/value pair.
		If the value is structured (has children), a handle is provided to retrieve the children with the VariablesRequest.
	*/
	export interface Variable {
		/** The variable's name */
		name: string;
		/** The variable's value. For structured objects this can be a multi line text, e.g. for a function the body of a function. */
		value: string;
		/** If variablesReference is > 0, the variable is structured and its children can be retrieved by passing variablesReference to the VariablesRequest. */
		variablesReference: number;
	}

	/** Information about a Breakpoint created in the setBreakpoints request.
	*/
	export interface Breakpoint {
		/** If true breakpoint could be set (but not necessarily at the correct location). */
		verified: boolean;
		/** The actual location of the breakpoint. */
		line: number;
	}
}
