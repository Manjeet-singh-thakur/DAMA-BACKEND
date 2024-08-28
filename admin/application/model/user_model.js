  /**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 
 * 
 * Written By  : Anoop kumar <mailto:anoop.zeroit@gmail.com>, may 2024
 * Description :
 * Modified By :
 */
const { async, defer } = require("q");
const axios = require('axios');
const q = require("q"),
  passwordHash = require("password-hash"),
  { v4 } = require("uuid"),
  helper = require("../helpers/index");
const mongoHelper = require("../helpers/mongo_helper");
const AccessToken = require("twilio/lib/jwt/AccessToken");

const userModel = {};
/**
 * This function is using to create users
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userModel.insertUser = async function (body, userId) {
  let deferred = q.defer();

  if (body) {
    let date = await helper.getUtcTime();
    let hashedPassword = passwordHash.generate(body.userPassword);
    
    let userUuid = v4(Date.now());
    let insertObj = {
      uc_uuid: userUuid,
      uc_fk_au_uuid: userId,
      uc_first_name: body.userName,
      uc_last_name: body.userLast,
      uc_email: body.userEmail,
      uc_password: hashedPassword,
      uc_notificationSetting: "0",
      uc_profile_visibility: "0",
      uc_privacyPolicy: "0",
      uc_security: "0",
      uc_profie_image:[],
      uc_cover_image: "",
      uc_activation_token: "",
      uc_active: "1",
      uc_deleted: "0",
      uc_created: date,
      uc_updated: date,
    };

    let results = await mongoHelper.insert(insertObj, "users_credential");

    if (results) {
      deferred.resolve(userUuid);
    } else {
      deferred.resolve(false);
    }
  } else {
    deferred.resolve(false);
  }

  return deferred.promise;
};

// ----------------------------------------------------------------------------
userModel.uploadUserMultiple = async function (userUuid, fileName) {
  let deferred = q.defer();
  if (userUuid && fileName) {
    console.log("filename", fileName);
    let selectObj = {
      uc_uuid: userUuid,
    };
    
    console.log(
      selectObj,
      "userUuiduserUuiduserUuiduserUuid",
      fileName,
      "fileNamefileNamefileNamefileNameeeeeeeeeeeeeeee",
      userUuid,
      "userUuiddddddddddddddddddddddddddddd"
    );
    let updateObj = {
      uc_profie_image: fileName,
    };
    let result = await mongoHelper.updateData(selectObj, "users_credential", updateObj);
    console.log(result, "Resultttttttttttttttttttttttt--------------------");
    if (result) {
      deferred.resolve(true);
    } else {
      deferred.resolve(false);
    }
  } else {
    deferred.resolve(false);
  }
  return deferred.promise;
};



/**
 * This function is using to get the list of all users
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userModel.getuserlist = async function (body) {
  let deferred = q.defer();
  let UserObj = {
    uc_deleted: "0",
  };
  let userArray = await mongoHelper.getuserListData(
    UserObj,
    "users_credential",
    body
  );
  if (userArray && userArray.data && userArray.data.length > 0) {
    for (const result of userArray.data) {
      result.uc_created = helper.dateFormat(result.uc_created, "date");
    }

    deferred.resolve(userArray);
  } else {
    deferred.resolve([]);
  }

  return deferred.promise;
};

/**
 * This function is using to delete user by id
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userModel.deleteuser = async function (body) {
  let deferred = q.defer();

  if (body.userId) {
    let selectObj = {
      uc_uuid: body.userId,
    };
    let updateObj = {
      uc_deleted: "1",
    },
      result = await mongoHelper.updateData(
        selectObj,
        "users_credential",
        updateObj
      );

    if (result) {
      deferred.resolve(true);
    } else {
      deferred.resolve(false);
    }
  } else {
    deferred.resolve(false);
  }

  return deferred.promise;
};

/**
 * this is using for edit member
 *
 * @param   :
 * @developer   :Anoop Kumar
 */
userModel.editUser = async function (body, userId) {
  let deferred = q.defer();

  if (body) {
    let date = await helper.getUtcTime();
    let userUuid = v4(Date.now());
    let selectObj = {
      uc_uuid: body.userId,
    };
    console.log(selectObj,"0000000000000000000000000000000")
    let editObj = {
      uc_first_name: body.userName,
      uc_last_name: body.userLast,
      uc_email: body.userEmail,
      uc_created: date,
      uc_updated: date,
    };
    console.log(editObj, "ppppppppppppppppppppppppppppppp");
    let results = await mongoHelper.updateData(
      selectObj,
      "users_credential",
      editObj
    );
    if (results) {
      deferred.resolve(userUuid);
    } else {
      deferred.resolve(false);
    }
  } else {
    deferred.resolve(false);
  }
  return deferred.promise;
};

/**
 * This function is using
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userModel.insertPaymentSettings = async function (body, userId) {
  let deferred = q.defer();

  if (!body) {
    console.error("Invalid request body");
    deferred.resolve({
      status: false,
      code: "ASL-E1001",
      message: "Invalid request body",
      payload: [],
    });
    return deferred.promise;
  }

  console.log("Incoming body:", body);
  let date = await helper.getUtcTime();
  let statusValue;

  // Determine status based on active or inactive field
  if (body.active !== undefined) {
    statusValue = body.active === "1" ? "1" : "0"; // Set status to 1 if active is "1", otherwise set to 0
  } else if (body.inactive !== undefined) {
    statusValue = body.inactive === "1" ? "0" : "1"; // Set status to 0 if inactive is "1", otherwise set to 1
  } else {
    console.error(
      "Neither 'active' nor 'inactive' is present in the request body"
    );
    deferred.resolve({
      status: false,
      code: "ASL-E1005",
      message: "Neither 'active' nor 'inactive' is present in the request body",
      payload: [],
    });
    return deferred.promise;
  }

  console.log("Determined statusValue:", statusValue);
  let insertObj = {
    users_id: userId,
    client_id: body.client_id,
    secret: body.secret,
    type: "paypal",
    created_at: date,
    updated_at: date,
    status: statusValue,
  };

  console.log("Insert object:", insertObj);

  // console.log(existingPaymentSettings+"00000000000000000000000000-_______________")
  try {
    let existingPaymentSettings = await mongoHelper.getRow(
      { users_id: userId },
      "payment_settings"
    );
    if (existingPaymentSettings) {
      let updateObj = {
        status: statusValue,
        updated_at: date,
      };
      let updateResult = await mongoHelper.updateDataOne(
        { users_id: userId },
        updateObj,
        "payment_settings"
      );
      console.log("Update result:", updateResult);

      if (updateResult) {
        deferred.resolve({
          status: true,
          message: "Payment settings updated successfully",
          payload: [],
        });
      } else {
        console.error("Update failed:", updateResult);
        deferred.resolve({
          status: false,
          code: "ASL-E1002",
          message: "Failed to update payment settings",
          payload: [],
        });
      }
    } else {
      // If payment settings do not exist, insert a new record
      let insertResult = await mongoHelper.insert(
        insertObj,
        "payment_settings"
      );
      console.log("Insert result:", insertResult);

      if (insertResult && insertResult.insertedCount > 0) {
        deferred.resolve({
          status: true,
          message: "Payment settings inserted successfully",
          payload: [],
        });
      } else {
        console.error("Insertion failed:", insertResult);
        deferred.resolve({
          status: false,
          code: "ASL-E1003",
          message: "Failed to insert payment settings",
          payload: [],
        });
      }
    }
  } catch (error) {
    console.error("Error inserting/updating payment settings:", error);
    deferred.resolve({
      status: false,
      code: "ASL-E1004",
      message: "Error inserting/updating payment settings",
      payload: [],
    });
  }

  return deferred.promise;
};

/**
 * This function is using
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userModel.insertStripe = async function (body, userId) {
  let deferred = q.defer();

  if (!body) {
    console.error("Invalid request body");
    deferred.resolve({
      status: false,
      code: "ASL-E1001",
      message: "Invalid request body",
      payload: [],
    });
    return deferred.promise;
  }

  console.log("Incoming body:", body);
  let date = await helper.getUtcTime();
  let statusValue;

  // Determine status based on active or inactive field
  if (body.active !== undefined) {
    statusValue = body.active === "1" ? "1" : "0"; // Set status to 1 if active is "1", otherwise set to 0
  } else if (body.inactive !== undefined) {
    statusValue = body.inactive === "1" ? "0" : "1"; // Set status to 0 if inactive is "1", otherwise set to 1
  } else {
    console.error(
      "Neither 'active' nor 'inactive' is present in the request body"
    );
    deferred.resolve({
      status: false,
      code: "ASL-E1005",
      message: "Neither 'active' nor 'inactive' is present in the request body",
      payload: [],
    });
    return deferred.promise;
  }

  console.log("Determined statusValue:", statusValue);
  let insertObj = {
    user_id: userId,
    publish_key: body.publish_key,
    api_key: body.api_key,
    type: "stripe",
    created_at: date,
    updated_at: date,
    status: statusValue,
  };

  console.log("Insert object:", insertObj);

  try {
    let existingPaymentSettings = await mongoHelper.getRow(
      { user_id: userId },
      "payment_settings"
    );

    if (existingPaymentSettings) {
      // If payment settings already exist for the user, update the status only
      let updateObj = {
        status: statusValue,
        updated_at: date,
      };
      let updateResult = await mongoHelper.updateDataOne(
        { user_id: userId },
        updateObj,
        "payment_settings"
      );
      console.log("Update result:", updateResult);

      if (updateResult && updateResult.modifiedCount > 0) {
        deferred.resolve({
          status: true,
          message: "Payment settings updated successfully",
          payload: [],
        });
      } else {
        console.error("Update failed:", updateResult);
        deferred.resolve({
          status: false,
          code: "ASL-E1002",
          message: "Failed to update payment settings",
          payload: [],
        });
      }
    } else {
      // If payment settings do not exist, insert a new record
      let insertResult = await mongoHelper.insert(
        insertObj,
        "payment_settings"
      );
      console.log("Insert result:", insertResult);

      if (insertResult && insertResult.insertedCount > 0) {
        deferred.resolve({
          status: true,
          message: "Payment settings inserted successfully",
          payload: [],
        });
      } else {
        console.error("Insertion failed:", insertResult);
        deferred.resolve({
          status: false,
          code: "ASL-E1003",
          message: "Failed to insert payment settings",
          payload: [],
        });
      }
    }
  } catch (error) {
    console.error("Error inserting/updating payment settings:", error);
    deferred.resolve({
      status: false,
      code: "ASL-E1004",
      message: "Error inserting/updating payment settings",
      payload: [],
    });
  }

  return deferred.promise;
};

/**
 * for insert about content
 * @param   :
 * @developer   : Manjeet Thakur
 */
userModel.insertAboutContent = async (body) => {
  try {
    let date = await helper.getUtcTime();
    let uuid = v4(Date.now());
    let insertObj = {
      a_uuid: uuid,
      a_title: body.title,
      a_content: body.content,
      a_created: date,
      a_updated: date,
      a_deleted: "0",
    };
    let insertContent = await mongoHelper.insert(insertObj, "about_us_content");
    console.log("insertContent", insertContent);
    if (insertContent) {
      return insertContent;
    } else {
      return false;
    }
  } catch (error) { }
};


userModel.dashboardGraph = async function (userId) {
  let deferred = q.defer();
  if (userId) {
    const newArray = [];
    let trandbnObj1 = {
      ut_fk_uc_uuid: userId,
      ut_type: "CR",
    };
    let transactArray = await mongoHelper.getData(
      trandbnObj1,
      "users_transactions"
    );
    let obja = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sept: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };
    transactArray.forEach(function (transactArray) {
      let nextMonth = "";
      var transactionArray = transactArray.ut_created;
      var transamount = transactArray.ut_amount;
      newArray.push(transamount);
      monthname = helper.getMonthDate(transactionArray);


      var array = monthname.split(",");
    });

    deferred.resolve(newArray);
  } else {
    deferred.resolve(false);
  }

  return deferred.promise;
};

userModel.dashboardGraph1 = async function (userId) {
  let deferred = q.defer();

  if (userId) {
    const newArray1 = [];
    let trandbnObj = {
      ut_fk_uc_uuid: userId,
      ut_type: "DB",
    };
    let transactArray1 = await mongoHelper.getData(
      trandbnObj,
      "users_transactions"
    );
    let obja = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sept: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };
    transactArray1.forEach(function (transactArray1) {
      let nextMonth = "";
      var transactionArray1 = transactArray1.ut_created;
      var transamount = transactArray1.ut_amount;
      newArray1.push(transamount);
      monthname = helper.getMonthDate(transactionArray1);
      var array = monthname.split(",");
    });

    deferred.resolve(newArray1);
  } else {
    deferred.resolve(false);
  }

  return deferred.promise;
};

/**
 * This function is using
 * @param     :body have object and userId
 * @returns   :
 * @developer :Vishal Kumar
 */
userModel.insertPaymentDetails = async function (body, userId) {
  const deferred = q.defer();

  if (!body) {
    console.error("Invalid request body");
    deferred.resolve({
      status: false,
      code: "ASL-E1001",
      message: "Invalid request body",
      payload: [],
    });
    return deferred.promise;
  }

  console.log("Incoming body:", body);
  let date = await helper.getUtcTime();

  // these url is only for testing, Replace these with actual website url
  // const domain = "http://52.55.77.120" live
  const domain = "https://2134-122-173-30-220.ngrok-free.app";

  let insertObj = {
    ut_users_id: userId,
    ut_initiator: "testapi",
    ut_command_id: "BusinessPayBill",
    ut_amount: body.amount,
    ut_party_a: "600426",
    ut_party_b: "600000",
    ut_account_reference: "353353",
    ut_requester: "254708374149",
    ut_remarks: "Your request is processing",
    ut_result_type : "",
    ut_result_code : "",
    ut_result_desc : "",
    ut_originator_conversation_id : "",
    ut_transaction_id : "",
    ut_referenceData: "",
    created_at: date,
    updated_at: date,
  };

  // console.log("Insert object:", insertObj);

  // const url = 'https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest';
  // const token = await helper.generateOAuthToken();

  try {
    await helper.generateOAuthToken()
      .then(async (token) => {
        function getFormattedTimestamp() {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          return `${year}${month}${day}${hours}${minutes}${seconds}`;
        }
        const url = 'https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest';
        const timeStamp = getFormattedTimestamp();
        const password = new Buffer.from(
          "174379" +
          "ZX/XIdGo2Rc0uc7KIZ8N6C78tKGduE4aL54eIcARbpgEAdUzf8W6khxeOOu/TIR+zEbCkZuDMWXTcPgjHqHEofedV+8gxmiw3Wy+ts1DBgrNq1obwt23PpMAjsYmNWNPFnQ9xH3pmHf3tCZMpnwHPW3BiRcbdNargH0F4fpemBGRU9wuCBegQRIgRnFmMQnqrz3X65iYjocGSXprCTOJUXw1/CDOoq9D3Vxz8vuwd2umWYNSYkW7mBmO2BABqM+xCVFKzTR63ChiLDTGicidXQN76+08eQPCvhiV9ZPBAgVWwRNGgJLQ0dtTjbKHtDv/hxDMRoZgOFUe7yZCjaYSWQ==" + timeStamp
        ).toString("base64");

        insertObj.ut_security_credential = password;


        const response = await axios.post(url,
          {
            users_id: userId,
            Initiator: "testapi",
            CommandID: "BusinessPayBill",
            SecurityCredential:password,
            SenderIdentifierType: "4",
            RecieverIdentifierType: "4",
            Amount: body.amount,
            PartyA: "600426",
            PartyB: "600000",
            AccountReference: "353353",
            Requester: "254708374149",
            Remarks: "ok",
            QueueTimeOutURL: `${domain}/admin/b2b/queue/`,
            ResultURL: `${domain}/admin/b2b/result/`,
            created_at: date,
            updated_at: date,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.data && response.data.ResponseCode === '0') {
            console.log(response.data.ConversationID)
            insertObj.ut_conversation_id = response.data.ConversationID;
            let insertResult = await mongoHelper.insert(
              insertObj,
              "users_transactions_details"
            );

            console.log("Insert result:", insertResult);
      
      
            deferred.resolve({
              status: true,
              message: 'Payment details inserted successfully',
              payload: response.data,
      
            });
          } else {
            console.error('Payment failed:', response.data);
            deferred.resolve({
              status: false,
              code: "ASL-E1002",
              message: 'Failed to insert payment details',
              payload: response.data,
            });
          }
      })
  } catch (error) {
    console.error('Error inserting/updating payment details:', error.response ? error.response.data : error.message);
    deferred.resolve({
      status: false,
      code: "ASL-E1004",
      message: {message:'Error inserting/updating payment details',
        errorMessage:error.response.data
      },
      payload: [],
    });
  }

  return deferred.promise;
};

/**
 * This function is using
 * @param     : body have object and userId
 * @returns   :
 * @developer :Vishal Kumar
 */
userModel.insertPaymentResult = async function(body){
  try {
    let date = await helper.getUtcTime();
    let selectObj = {
      ut_conversation_id: body.ConversationID,
    };
     console.log("0000000000000000000000000000",body.ConversationID,"----")
    let updatedObj = { 
        ut_remarks:"ok",
        ut_result_type : body.ResultType,
        ut_result_code : body.ResultCode,
        ut_result_desc : body.ResultDesc,
        ut_originator_conversation_id : body.OriginatorConversationID,
        ut_transaction_id : body.TransactionID,
        ut_referenceData: body.ReferenceData,
        created_at:date,   
        updated_at: date,
    };
    let insertContent = await mongoHelper.updateData(selectObj,"users_transactions_details",updatedObj);
    console.log("insertContent+++++++++++++", insertContent);
    if (insertContent) {
      return insertContent;
    } else {
      return false;
    }
  } catch (error) { }
}



module.exports = userModel;
