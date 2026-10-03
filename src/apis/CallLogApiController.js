import { BaseAPI, ApiError } from "./BaseAPI";

class CallLogApi extends BaseAPI {
  static serviceName = "CallLog";

  static async requestToApi({
    mode,
    params,
    yearCode,
    functionName,
    socketEvent,
  }) {
    return super.requestToApi({
      mode,
      params,
      yearCode,
      functionName,
      serviceName: this.serviceName,
      socketEvent,
    });
  }

  // Fetch Call Logs
  static async getCallLogs({
    statusId,
    projectId,
    filter,
    startDate,
    endDate,
    searchTerm,
  }) {
    try {
      const params = {
        StatusId: statusId,
        ProjectID: projectId,
        Filter: filter,
        StartDate: startDate,
        EndDate: endDate,
        SearchTerm: searchTerm,
      };
      const response = await this.requestToApi({
        mode: "CALLLOGLIST",
        params,
        functionName: "CALLLOGLIST",
      });
      return response;
    } catch (error) {
      console.error("Error fetching call logs:", error);
      throw error;
    }
  }

  // Fetch Call Logs
  static async getArchivedCallLogList({
    statusId,
    projectId,
    filter,
    startDate,
    endDate,
    searchTerm,
  }) {
    try {
      const params = {
        StatusId: statusId,
        ProjectID: projectId,
        Filter: filter,
        StartDate: startDate,
        EndDate: endDate,
        SearchTerm: searchTerm,
      };
      const response = await this.requestToApi({
        mode: "ARCHIVEDCALLLOGLIST",
        params,
        functionName: "ARCHIVED",
      });
      return response;
    } catch (error) {
      console.error("Error fetching call logs:", error);
      throw error;
    }
  }

  // Restore Archived Call Logs
  static async restoreArchivedCallLogs({ restoreIds }) {
    try {
      const params = {
        RestoreIds: restoreIds,
      };

      const response = await this.requestToApi({
        mode: "RESTOREARCHIVE",
        params,
        functionName: "CallLog",
      });

      return response;
    } catch (error) {
      console.error("Error restoring archived call logs:", error);
      throw error;
    }
  }

  // Fetch Call Queue
  static async getCallQueue() {
    try {
      const params = {};
      const response = await this.requestToApi({
        mode: "CALLQUEUE",
        params,
        functionName: "CALLQUEUE",
      });
      return response;
    } catch (error) {
      console.error("Error fetching call queue:", error);
      throw error;
    }
  }

  // Get Master Data
  static async getMasterData() {
    try {
      const params = {};
      const response = await this.requestToApi({
        mode: "FILTER",
        params,
        functionName: "FILTER",
      });
      return response;
    } catch (error) {
      console.error("Error fetching call logs:", error);
      throw error;
    }
  }

  static async getEmployeeMasterD() {
    try {
      const params = {};
      const response = await this.requestToApi({
        mode: "EMPLOYEE_LIST",
        params,
        functionName: "EMPLOYEE_LIST",
      });
      return response;
    } catch (error) {
      console.error("Error fetching call logs:", error);
      throw error;
    }
  }

  // Add a Call
  static async addCall({
    entryDate,
    customerName,
    projectID,
    appID,
    description,
    deptId,
    empId,
    source,
    createdBy,
    callType,
    ParentCalllogId,
  }) {
    try {
      const params = {
        EntryDate: entryDate,
        CustomerName: customerName,
        ProjectID: projectID,
        AppId: appID,
        Descr: description,
        Source: source,
        CreatedBy: createdBy,
        CallTypeId: callType,
        ...(ParentCalllogId && {
          ParentCalllogId: ParentCalllogId,
        }),
      };
      if (deptId) params.DeptId = deptId;
      if (empId) params.EmpId = empId;

      const response = await this.requestToApi({
        mode: "ADDCALL",
        params,
        functionName: "ADDCALL",
        socketEvent: "AddCall",
      });

      return response;
    } catch (error) {
      console.error("Error adding call:", error);
      throw error;
    }
  }

  static async editCallApi(
    CallLogid,
    createdBy,
    customerName,
    PriorityId,
    ParentId,
    description,
    employeeId,
    DeptId,
    status,
    Estatus,
    calldetails,
    EntryDate,
    callType,
    AppId,
  ) {
    try {
      const params = {
        CallLogid: CallLogid,
        CreatedBy: createdBy,
        CustomerName: customerName || "",
        PriorityId: PriorityId || "",
        ParentId: ParentId || "",
        Descr: description || "",
        EmpId: employeeId || "",
        DeptId: DeptId || "",
        StatusId: status || "",
        calldetails: calldetails || "",
        Estatus: Estatus || "",
        EntryDate: EntryDate || "",
        CallTypeId: callType || "",
        AppId: AppId || "",
      };
      const response = await this.requestToApi({
        mode: "EDIT",
        params,
        functionName: "EDIT",
      });

      return response;
    } catch (error) {
      console.error("Error adding call:", error);
      throw error;
    }
  }

  static async updateCallDynamic(updateData = {}) {
    try {
      // Allowed fields for update
      const allowedKeys = {
        CallLogid: "CallLogid",
        createdBy: "CreatedBy",
        customerName: "CustomerName",
        PriorityId: "PriorityId",
        ParentId: "ParentId",
        description: "Descr",
        employeeId: "EmpId",
        DeptId: "DeptId",
        status: "StatusId",
        Estatus: "Estatus",
        calldetails: "calldetails",
        EntryDate: "EntryDate",
        callType: "CallTypeId",
        AppId: "AppId",
      };

      const params = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedKeys[key] !== undefined && updateData[key] !== undefined) {
          params[allowedKeys[key]] = updateData[key];
        }
      });

      if (!params.CallLogid) {
        throw new Error("CallLogid is required for update.");
      }

      const response = await this.requestToApi({
        mode: "EDIT",
        params,
        functionName: "EDIT",
      });

      return response;
    } catch (error) {
      console.error("Error updating call dynamically:", error);
      throw error;
    }
  }

  // Start a Call
  static async startCall({ callLogId, createdBy }) {
    try {
      const params = { CallLogid: callLogId, CreatedBy: createdBy };
      const response = await this.requestToApi({
        mode: "CALLSTART",
        params,
        functionName: "CALLSTART",
      });
      return response;
    } catch (error) {
      console.error("Error starting call:", error);
      throw error;
    }
  }

  // Pause a Call
  static async pauseCall({ callLogId }) {
    try {
      const params = { CallLogid: callLogId };
      const response = await this.requestToApi({
        mode: "CALLPAUSE",
        params,
        functionName: "CALLPAUSE",
      });
      return response;
    } catch (error) {
      console.error("Error pausing call:", error);
      throw error;
    }
  }

  // Resume a Call
  static async resumeCall({ callLogId }) {
    try {
      const params = { CallLogid: callLogId };
      const response = await this.requestToApi({
        mode: "CALLRESUME",
        params,
        functionName: "CALLRESUME",
      });
      return response;
    } catch (error) {
      console.error("Error resuming call:", error);
      throw error;
    }
  }

  // End a Call
  static async endCall({ callLogId, createdBy }) {
    try {
      const params = { CallLogid: callLogId, CreatedBy: createdBy };
      const response = await this.requestToApi({
        mode: "CALLEND",
        params,
        functionName: "CALLEND",
      });
      return response;
    } catch (error) {
      console.error("Error ending call:", error);
      throw error;
    }
  }

  static async AcceptCall({ callLogId, createdBy }) {
    try {
      const params = { CallLogid: callLogId, CreatedBy: createdBy };
      const response = await this.requestToApi({
        mode: "ACCEPTCALL",
        params,
        functionName: "ACCEPTCALL",
        socketEvent: "AcceptCall",
      });
      return response;
    } catch (error) {
      console.error("Error starting call:", error);
      throw error;
    }
  }

  // Add Call Comments
  static async addCallComments(callLogId, comments, filePath, createdBy) {
    try {
      const params = {
        CallLogid: callLogId,
        Comments: comments,
        FilePath: filePath,
        CreatedBy: createdBy,
      };
      const response = await this.requestToApi({
        mode: "COMMENTS",
        params,
        functionName: "COMMENTS",
      });
      return response;
    } catch (error) {
      console.error("Error adding comments to call:", error);
      throw error;
    }
  }

  // Add Feedback
  static async addFeedback({ callLogId, feedback, ratingByCustomer }) {
    try {
      const params = {
        CallLogid: callLogId,
        Feedback: feedback,
        RatingByCustomer: ratingByCustomer,
      };
      const response = await this.requestToApi({
        mode: "FEEDBACK",
        params,
        functionName: "FEEDBACK",
      });
      return response;
    } catch (error) {
      console.error("Error adding feedback:", error);
      throw error;
    }
  }

  // Change Internal Status
  static async changeInternalStatus({ callLogId, statusId, createdBy }) {
    try {
      const params = {
        CallLogid: callLogId,
        StatusId: statusId,
        CreatedBy: createdBy,
      };
      const response = await this.requestToApi({
        mode: "IS",
        params,
        functionName: "IS",
      });
      return response?.rd?.[0];
    } catch (error) {
      console.error("Error changing internal status:", error);
      throw error;
    }
  }

  // Change External Status and Priority
  static async changeExternalStatusAndPriority({
    callLogId,
    statusId,
    priorityId,
    createdBy,
  }) {
    try {
      const params = { CallLogid: callLogId, CreatedBy: createdBy };
      if (statusId) {
        params.Estatus = statusId;
      }
      if (priorityId) {
        params.PriorityId = priorityId;
      }

      const response = await this.requestToApi({
        mode: "ES",
        params,
        functionName: "ES",
      });

      return response?.rd?.[0];
    } catch (error) {
      console.error("Error changing external status and priority:", error);
      throw error;
    }
  }

  // Forward a Call
  static async forwardCall({
    callLogId,
    deptId,
    empId,
    createdBy,
    statusId,
    ResonId = 6,
  }) {
    try {
      const params = {
        CallLogid: callLogId,
        DeptId: deptId,
        EmpId: empId,
        CreatedBy: createdBy,
        StatusId: statusId,
        ResonId: ResonId,
      };
      const response = await this.requestToApi({
        mode: "FORWARDED",
        params,
        functionName: "FORWARDED",
        socketEvent: "ForwardedCall",
      });
      return response;
    } catch (error) {
      console.error("Error forwarding call:", error);
      throw error;
    }
  }

  static async EditCallDuration({ callLogId, StartDateTime, EndDateTime }) {
    try {
      const params = {
        CallLogid: callLogId,
        StartDateTime: StartDateTime,
        EndDateTime: EndDateTime,
      };
      const response = await this.requestToApi({
        mode: "CALL_TIME_EDIT",
        params,
        functionName: "CALL_TIME_EDIT",
      });
      return response?.rd?.[0];
    } catch (error) {
      console.error("Error editing call duration:", error);
      throw error;
    }
  }

  // Add Follow Up Call
  static async addFollowUpCall({ callLogId, createdBy }) {
    try {
      const params = { CallLogid: callLogId, CreatedBy: createdBy };
      const response = await this.requestToApi({
        mode: "ADDFLLOWUPCALL",
        params,
        functionName: "ADDFLLOWUPCALL",
      });
      return response;
    } catch (error) {
      console.error("Error adding follow up call:", error);
      throw error;
    }
  }

  // Start Follow Up Call
  static async startFollowUpCall({ followUpCallId, callLogId, createdBy }) {
    try {
      const params = {
        FollowUpCallId: followUpCallId,
        CallLogid: callLogId,
        CreatedBy: createdBy,
      };
      const response = await this.requestToApi({
        mode: "STARTFLLOWUPCALL",
        params,
        functionName: "STARTFLLOWUPCALL",
      });
      return response;
    } catch (error) {
      console.error("Error starting follow up call:", error);
      throw error;
    }
  }

  // Pause Follow Up Call
  static async pauseFollowUpCall({ followUpCallId, callLogId }) {
    try {
      const params = { FollowUpCallId: followUpCallId, CallLogid: callLogId };
      const response = await this.requestToApi({
        mode: "PAUSEFLLOWUPCALL",
        params,
        functionName: "PAUSEFLLOWUPCALL",
      });
      return response;
    } catch (error) {
      console.error("Error pausing follow up call:", error);
      throw error;
    }
  }

  // Resume Follow Up Call
  static async resumeFollowUpCall({ followUpCallId, callLogId }) {
    try {
      const params = { FollowUpCallId: followUpCallId, CallLogid: callLogId };
      const response = await this.requestToApi({
        mode: "RESUMEFLLOWUPCALL",
        params,
        functionName: "RESUMEFLLOWUPCALL",
      });
      return response;
    } catch (error) {
      console.error("Error resuming follow up call:", error);
      throw error;
    }
  }

  // End Follow Up Call
  static async endFollowUpCall({ followUpCallId, callLogId }) {
    try {
      const params = { FollowUpCallId: followUpCallId, CallLogid: callLogId };
      const response = await this.requestToApi({
        mode: "ENDFLLOWUPCALL",
        params,
        functionName: "ENDFLLOWUPCALL",
      });
      return response;
    } catch (error) {
      console.error("Error ending follow up call:", error);
      throw error;
    }
  }

  // Edit Follow Up Call
  static async editFollowUpCall({
    callLogId,
    followUpCallId,
    empId,
    statusId,
    descr,
  }) {
    try {
      const params = {
        CallLogid: callLogId,
        FollowUpCallId: followUpCallId,
      };

      if (empId !== undefined) params.EmpId = empId;
      if (statusId !== undefined) params.StatusId = statusId;
      if (descr !== undefined) params.Descr = descr;

      const response = await this.requestToApi({
        mode: "EDITFLLOWUPCALL",
        params,
        functionName: "EDITFLLOWUPCALL",
      });
      return response;
    } catch (error) {
      console.error("Error editing follow up call:", error);
      throw error;
    }
  }
}

export default CallLogApi;
