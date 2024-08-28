/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 *
 * Written By  : Anoop <anoop.zeroit@gmail.com>, may 2024
 * Description :
 * Modified By :
 */

const fs = require("fs"),
  path = require("path")
const helper = require("../helpers/index"),
Busboy = require("busboy");
  userModel = require("../model/user_model");
const mongoHelper = require("../helpers/mongo_helper");
let userObj = {};

/**
 * This function is using to create users
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userObj.insertUser = async function (req, res) {
  console.log(req.body.desc,"req.body.description-------------------")
  let user = helper.getUidByToken(req);
  console.log(req.body)
  if (req) {
    if (
      req &&
      req.body &&
      req.body.userName &&
      req.body.userLast &&
      req.body.userPassword
    ) {
      let results = await userModel.insertUser(req.body, user.userId);
     if(results){
      helper.successHandler(res, {
        payload: {
          userUuid:results
        }
      });
    
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1000",
        message: "Something went wrong.",
        status: false,
      });
    }
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1002",
        message: "Please fill manadatory fields.",
        status: false,
      });
    }
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }
};

/**
 * This function is using to get the list of all users
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userObj.userListAjax = async function (req, res) {
  let user = helper.getUidByToken(req);

  if (user && user.userId) {
    let result = await userModel.getuserlist(req.body);
    res.render("userListAjax", {
      req: req,
      data: result,
    });
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }
};

/**
 * This function is using to delete user by id
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userObj.deleteUser = async function (req, res) {
  let user = helper.getUidByToken(req);

  if (user && user.userId) {
    if (req && req.body && req.body.userId) {
      let result = await userModel.deleteuser(req.body, user.userId);
      helper.successHandler(res, {});
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1002",
        message: "Please fill manadatory fields.",
        status: false,
      });
    }
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }
};

/**
 * This is using to admin logout
 * @param       :
 * @returns     :
 * @developer   :Anoop Kumar
 */
userObj.adminLogout = async function (req, res) {
  // Clear token cookie
  // res.clearCookie("token");

  // Clear relevant data from local storage
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminEmail");
  localStorage.removeItem("adminImage");

  // Send success response
  helper.successHandler(res, {});
};

/**
 * this is using for edit user
 *
 * @param    :
 * @dveloper    : Anoop
 */
userObj.editUser = async (req, res) => {
  const user = helper.getUidByToken(req);
  if (req) {
    if (
      req &&
      req.body &&
      req.body.userName &&
      req.body.userLast &&
      req.body.userEmail &&
      req.body.userId
    ) {
      let results = await userModel.editUser(req.body);
      if (results) {
        helper.successHandler(res, {
          payload: {
            userUuid: req.body.userId,
          },
        });
      } else {
        helper.errorHandler(res, {
          code: "ASL-E1000",
          message: "Something went wrong.",
          status: false,
        });
      }
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1002",
        message: "Please fill manadatory fields.",
        status: false,
      });
    }
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }
};

/**
 * this is using for get member by Id
 * @param    :
 * @developer    : Anoop Kumar
 */

userObj.getuserById = async (req, res) => {
  let user = helper.getUidByToken(req);
  try {
    if (user && user.userId) {
      let memberUuid = req.params.id;
      if (memberUuid) {
        let result = await mongoHelper.getRow(
          { uc_uuid: memberUuid },
          "users_credential"
        );
        if (result) {
          helper.successHandler(res, {
            code: "asl-E1002",
            message: "data fetched succesfully by id",
            status: true,
            payload: result,
          });
        } else {
          helper.errorHandler(res, {
            code: "asl-E1003",
            message: "error in getting responce",
            status: false,
          });
        }
      } else {
        helper.errorHandler(res, {
          code: "asl-E1004",
          message: "member uuid is required",
          status: false,
        });
      }
    } else {
      helper.errorHandler(res, {
        code: "asl-E1002",
        message: "unauthorized error",
        status: false,
      });
    }
  } catch (error) {}
};

/**
 * This function is using to create users
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userObj.insertPayments = async function (req, res) {
  let user = helper.getUidByToken(req);

  if (user && user.userId) {
    if (req && req.body && req.body.client_id && req.body.secret) {
      let result = await userModel.insertPaymentSettings(req.body, user.userId);
      if (result) {
        helper.successHandler(res, {});
      } else {
        helper.errorHandler(res, {
          code: "ASL-E1002",
          message: "Failed to insert payment settings.",
          status: false,
        });
      }
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1002",
        message: "Please fill all mandatory fields.",
        status: false,
      });
    }
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }
};

/**
 * This function is using to create users
 * @param     :
 * @returns   :
 * @developer :Anoop Kumar
 */
userObj.insertStripe = async function (req, res) {
  let user = helper.getUidByToken(req);

  if (user && user.userId) {
    if (req && req.body && req.body.publish_key && req.body.api_key) {
      console.log(
        req.body,
        ")))))))))))))))))))))))))))))))))TESTTTTTTTTTTTTTTTTTT",
        user.userId
      );

      let result = await userModel.insertStripe(req.body, user.userId);
      console.log(
        result,
        ")))))))))))))))))))))))))))))))))TESTTTTTTTTTTTTTTTTTT"
      );
      if (result) {
        helper.successHandler(res, {});
      } else {
        helper.errorHandler(res, {
          code: "ASL-E1002",
          message: "Failed to insert payment settings.",
          status: false,
        });
      }
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1002",
        message: "Please fill all mandatory fields.",
        status: false,
      });
    }
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }
};

/**
 * for insert about us content
 * @param   :
 * @dveloper   :  Manjeet Thakur
 */

userObj.insertAboutContent = async (req, res) => {
  try {
    let result = await userModel.insertAboutContent(req.body);
    if (result) {
      helper.successHandler(
        res,
        {
          status: true,
          payload: result,
          message: "About content is inserted succesfully",
        },
        200
      );
    } else {
      helper.errorHandler(
        res,
        {
          code: "asl_E1002",
          message: "no data avilable",
          status: false,
        },
        200
      );
    }
  } catch (error) {
    console.log(error);
    return helper.errorHandler(
      res,
      {
        code: "asl-E1002",
        message: "something went wrnong",
        status: false,
      },
      200
    );
  }
};

/**
 * for get About us content
 * @param   :
 * @developer  : Manjeet Thakur
 */

userObj.getAboutContent = async (req, res) => {
  try {
    let result = await userModel.getAboutContent();
    if (result) {
      helper.successHandler(
        res,
        {
          status: true,
          message: "data geted succesfully",
          payload: result,
        },
        200
      );
    } else {
      return helper.errorHandler(
        res,
        {
          code: "asl-E1002",
          message: "no data avilable",
          status: false,
        },
        200
      );
    }
  } catch (error) {
    return helper.errorHandler(
      res,
      {
        code: "asl-E1002",
        message: "something went wrong",
        status: false,
      },
      200
    );
  }
};

/**
 * for insert payment details
 * @param   :
 * @developer  : Vishal Kumar
 */

userObj.insertPayment = async function (req, res) {
  let user = helper.getUidByToken(req);
  // console.log(user.userId,"============================")
  if (user && user.userId) {
    if (req && req.body && req.body.amount) {
      const result = await userModel.insertPaymentDetails(
        req.body,
        user.userId
      );
      if (result) {
        helper.successHandler(res, {
          message: result.message,
          payload: result.payload,
        });
      } else {
        helper.errorHandler(res, {
          code: "ASL-E1002",
          message: "Failed to insert payment settings.",
          status: false,
        });
      }
    } else {
      helper.errorHandler(res, {
        code: "ASL-E1002",
        message: "Please fill mandatory fields.",
        status: false,
      });
    }
  } else {
    helper.errorHandler(res, {
      code: "ASL-E1002",
      message: "Unauthorized Error.",
      status: false,
    });
  }

  // try {
  //   const user = helper.getUidByToken(req);

  //   if (!user || !user.userId) {
  //     return helper.errorHandler(res, {
  //       code: "ASL-E1002",
  //       message: "Unauthorized Error.",
  //       status: false,
  //     });
  //   }

  //  let amount = req.body.amount;

  //   if (!amount) {
  //     return helper.errorHandler(res, {
  //       code: "ASL-E1002",
  //       message: "Please provide the amount.",
  //       status: false,
  //     });
  //   }

  //   const body = {
  //     CommandID: "BusinessPayBill",
  //     Initiator: "testapi",
  //     SecurityCredential: "ZX/XIdGo2Rc0uc7KIZ8N6C78tKGduE4aL54eIcARbpgEAdUzf8W6khxeOOu/TIR+zEbCkZuDMWXTcPgjHqHEofedV+8gxmiw3Wy+ts1DBgrNq1obwt23PpMAjsYmNWNPFnQ9xH3pmHf3tCZMpnwHPW3BiRcbdNargH0F4fpemBGRU9wuCBegQRIgRnFmMQnqrz3X65iYjocGSXprCTOJUXw1/CDOoq9D3Vxz8vuwd2umWYNSYkW7mBmO2BABqM+xCVFKzTR63ChiLDTGicidXQN76+08eQPCvhiV9ZPBAgVWwRNGgJLQ0dtTjbKHtDv/hxDMRoZgOFUe7yZCjaYSWQ==",
  //     PartyA: "600426",
  //     SenderIdentifierType: "4",
  //     PartyB: "600000",
  //     RecieverIdentifierType:"4",
  //     Requester: "254708374149",
  //     Amount: amount,
  //     AccountReference: "353353",
  //     Remarks: "ok",
  //     QueueTimeOutURL: "https://mydomain.com/b2b/queue/",
  //     ResultURL: "https://mydomain.com/b2b/result/"
  //   };

  // Add OAuth token to the body if necessary
  // body.oauthToken = oauthToken;

  //   const result = await userModel.insertPaymentDetails(body, user.userId);
  //   console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPP",result.status);

  //   if (result.status) {
  //     return helper.successHandler(res, {
  //       message: result.message,
  //       payload:result.payload,
  //     });
  //   } else {
  //     return helper.errorHandler(res, {
  //       code: result.code || "ASL-E1002",
  //       message: result.message || "Failed to insert payment details.",
  //       status: false,
  //     });
  //   }
  // } catch (error) {
  //   console.error("Error in insertPayments:", error);
  //   return helper.errorHandler(res, {
  //     code: "ASL-E1004",
  //     message: "An unexpected error occurred.",
  //     status: false,
  //   });
  // }
};

/**
 * for update payment details after request of payment
 * @param   :
 * @developer  : Vishal Kumar
 */

userObj.paymentResult = async function (req, res) {
  // console.log('Business Pay Bill Result:', resultData);

  const resultData = req.body;
  let resultObj = resultData.Result;
  // Handle the result data (e.g., save to database, log it, etc.)
  console.log("Business Pay Bill Result:", resultObj);
  if (resultObj) {
    let result = await userModel.insertPaymentResult(resultObj);
    console.log(
      "InsertpaymentResult function successfully inserted payment result data:",
      result
    );
    if (result) {
      res.status(200).json({
        data: resultObj,
        message: "Result received successfully",
      });
    } else {
      res.status(400).json({
        data: resultData,
        message: "insert payment result failed",
      });
    }
  } else {
    res.status(400).json({
      data: resultData,
      message: "NOT FOUND",
    });
  }
};

// Queue timeout endpoint handler
userObj.paymentQueueTimeout = async function (req, res) {
  const resultData = req.body;
  const resultObj = resultData.Result;

  //  data inside req.body
  //   {
  //     "Result": {
  //         "TransactionID": "some transaction id"
  //     }
  // }

  if (!resultObj) {
    return res.status(400).json({
      message: "Result data not found in the request",
    });
  }

  const updatedObj = {
    ut_result_type: "Timeout",
    ut_result_desc: "Transaction timed out",
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    const selectObj = { ut_transaction_id: resultObj.TransactionID }; // Ensure correct field name
    const result = await mongoHelper.updateDataOnee(
      selectObj,
      updatedObj,
      "users_transactions_details"
    );
    console.log(result.result, "55555555555555555555555555555555555");
    if (
      result.success &&
      (result.result.modifiedCount > 0 || result.result.upsertedCount > 0)
    ) {
      res.status(200).json({
        message: "Timeout received successfully",
      });
    } else {
      res.status(400).json({
        message: "Update failed, no matching record found",
      });
    }
  } catch (error) {
    console.error("Error processing timeout:", error);
    res.status(500).json({
      message: "Internal server error",
    }); 
  }
};



// -------------------------upload imagessssssssssssssssss
userObj.uploadUserMultiple = async function (req, res) {
  console.log("executeddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")
  let userId = helper.getUidByToken(req);
  if (userId) {
    const fields = {};
    let conObj = await constants.getConstant(),
      chunks = [],
      fNames = [],
      fTypes = [],
      fEncodings = [],
      busboy = Busboy({ headers: req.headers });
    busboy.on("field", async (fieldname, val) => {
      fields[fieldname] = val;
    });
    busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
      console.log("filename:", filename);
      let ext = path.extname(filename).toLowerCase();
      // let ext = path.extname(filename.filename).toLowerCase(); //live server
      console.log("ext:", ext);

      if (
        ext !== ".png" &&
        ext !== ".jpg" &&
        ext !== ".svg" &&
        ext !== ".gif" &&
        ext !== ".jpeg"
      ) {
        let obj = {
          status: true,
          code: "",
          message: "invalid extension!",
          payload: [],
        };
        chunks.push(obj);
        file.resume();
      } else {
        let newName = Date.now() + ext;
        fNames.push(newName.replace(/ /g, "_"));
        fTypes.push(mimetype);
        fEncodings.push(encoding);

        file.on("data", function (data) {
          chunks.push(data);
        });

        file.on("end", function () {
          console.log("File [" + filename + "] Finished");
        });
      }
    });

    busboy.on("finish", async function () {
      let userUuid = fields.userUuid;
      let fileObjects = [];
      for (let i = 0; i < fNames.length; i++) {
        let fileObj = {
          fileName: fNames[i],
          chunks: chunks,
          encoding: fEncodings[i],
          contentType: fTypes[i],
          uploadFolder: conObj.UPLOAD_PROOF_PATH + conObj.PROFILE_IMAGE_PATH,
        };
        fileObjects.push(fileObj);
      }

      let promises = fileObjects.map((fileObj) => helper.uploadFile(fileObj));
      console.log("promisespromisespromisespromisespromisespromises", promises);
      let returnObjs = await Promise.all(promises);

      let obj = {};
      if (returnObjs.every(Boolean)) {
        for (let returnObj of returnObjs) {
          returnObj.filename = fNames;
          let image = await userModel.uploadUserMultiple(
            userUuid,
            returnObj.filename
          );
          console.log("imageimageimageimageimageimageimageimageimage", image);
          if (image) {
            let returnRes = "";
            if (returnObj.Location) {
              returnRes = returnObj.Location;
            }
            obj.payload = returnRes;
          }
        }
        helper.successHandler(res, obj);
      } else {
        helper.errorHandler(
          res,
          { message: "Failed to upload one or more images" },
          500
        );
      }
    });

    return req.pipe(busboy);
  } else {
    helper.errorHandler(
      res,
      {
        status: false,
        message: "You are not authorized !!",
      },
      401
    );
  }
};





module.exports = userObj;
