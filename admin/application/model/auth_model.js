/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 
 * 
 * Written By  : anoop kumar <anoop.zeroit@gmail.com>, june 2024
 * Description :
 * Modified By :
 */
const q = require("q"),
  passwordHash = require("password-hash"),
  { v4 } = require("uuid"),
  helper = require("../helpers/index"),
  mongoHelper = require("../helpers/mongo_helper"),
  randomstring = require("randomstring"),
  commonModel = require("./common_model");
nodeMailer = require("nodemailer");

let authModel = {};

/**
 * This function is using
 * @param     :
 * @returns   :
 * @developer :
 */
authModel.sendActivationEmail = async function (body, activationCode) {
  let to = body.email,
    from = "Kawacha-mania <anoop.zeroit@gmail.com>";

  if (body.name) {
    username = body.name;
  }

  let sub = "Activation Account";

  let emailArray = {
    to: to,
    from: from,
    subject: sub,
    body: "Your activation code is " + activationCode,
  };

  if (commonModel.generalMail(emailArray)) {
    return true;
  }
  return false;
};
/**
 * Forgot password model
 * @param     :
 * @returns   :
 * @developer :
 */
authModel.forgotPassword = async function (email) {
  let deferred = q.defer(),
    selectObj = {
      au_email: email,
    },
    results = await mongoHelper.getData(selectObj, "admin-user");
  if (results && results.length > 0) {
    if (results[0].au_active == "1") {
      let randomNumber = Math.floor(Math.random() * (9999 - 1000) + 1000),
        updateObj = {
          au_activation_token: randomNumber,
        },
        result = await mongoHelper.updateData(
          selectObj,
          "admin-user",
          updateObj
        );
      if (result) {
        let emailArray = {
          to: email,
          from: "Kawacha-mania <rohit.zeroit@gmail.com>",
          subject: "Forgot password ",
          body: "Your forgot password token is " + randomNumber + ".",
        };

        commonModel.generalMail(emailArray);

        deferred.resolve({
          message: "Forgot password token sent to your email",
        });
      } else {
        deferred.resolve(false);
      }
    } else {
      deferred.resolve({
        code: "CCS-E1002",
      });
    }
  } else {
    deferred.resolve({
      code: "CCS-E1013",
    });
  }

  return deferred.promise;
};

/**
 * Reset password model
 * @param     :
 * @returns   :
 * @developer :
 */
authModel.resetPassword = async function (body) {
  let deferred = q.defer(),
    selectObj = {
      au_email: body.email,
    },
    results = await mongoHelper.getData(selectObj, "admin-user");

  if (results && results.length > 0) {
    if (results[0].au_activation_token == body.code) {
      let hashedPassword = passwordHash.generate(body.password);

      let updateObj = {
          au_activation_token: "",
          au_password: hashedPassword,
        },
        result = await mongoHelper.updateData(
          selectObj,
          "admin-user",
          updateObj
        );

      if (result) {
        deferred.resolve(true);
      } else {
        deferred.resolve({
          code: "CCS-E1110",
        });
      }
    } else {
      deferred.resolve({
        code: "CCS-E1010",
      });
    }
  } else {
    deferred.resolve({
      code: "CCS-E1013",
    });
  }

  return deferred.promise;
};

/**
 * This function is using for chage admin password
 * @param     :
 * @returns   :
 * @developer :Manjeet Thakur
 */

authModel.adminChangePassword = async function (body, userId) {
  let deferred = q.defer();

  try {
    let checkingUuid = {
      au_uuid: userId.userId,
    };
    console.log("check", checkingUuid);

    let adminData = await mongoHelper.getData(checkingUuid, "admin-user");
    console.log("result", adminData);

    if (!adminData) {
      deferred.resolve({ message: "User not found" });
      return deferred.promise;
    }

    let verifyPassword = passwordHash.verify(
      body.currentPassword,
      adminData[0].au_password
    );
    console.log("verifyPass", verifyPassword);

    if (verifyPassword) {
      let hashedPassword = passwordHash.generate(body.password);
      console.log("password", hashedPassword);

      let passwordObj = {
        au_password: hashedPassword,
      };

      let resultOne = await mongoHelper.updateData(
        checkingUuid,
        "admin-user",
        passwordObj
      );
      console.log("update result", resultOne);

      if (resultOne) {
        deferred.resolve(resultOne);
      } else {
        deferred.resolve({ message: "Password update failed" });
      }
    } else {
      deferred.resolve({ message: "Current password not matched" });
    }
  } catch (err) {
    console.error("Error in adminChangePassword:", err);
    deferred.reject(err);
  }

  return deferred.promise;
};

/**
 * This function is using for edit admin profile
 * @param     :
 * @returns   :
 * @developer :Manjeet Thakur
 */

authModel.adminEditProfile = async function (body, userId) {
  let deferred = q.defer();
  let checkingUuid = {
    au_uuid: userId.userId,
  };
  let result = await mongoHelper.getData(checkingUuid, "admin-user");

  if (result) {
    let updateObj = {
      au_firstname: body.firstname,
      au_lastname: body.lastname,
      au_email: body.email,
    };

    let resultOne = await mongoHelper.updateData(
      checkingUuid,
      "admin-user",
      updateObj
    );
    let resultO = await mongoHelper.getData(checkingUuid, "admin-user");
    if (resultOne) {
      deferred.resolve(resultO);
    } else {
      deferred.resolve(false);
    }
    deferred.resolve(false);
  } else {
    deferred.resolve(false);
  }
  return deferred.promise;
};
/**
 * editUploadImage
 * @param     :
 * @returns   :
 * @developer : Manjeet
 */
authModel.editUploadImage = async function (userId, fileName) {
  let deferred = q.defer();
  if (userId && fileName) {
    let selectObj = {
      au_uuid: userId,
    };

    let updateObj = {
      au_profileImage: fileName,
    };
    let result = await mongoHelper.updateData(
      selectObj,
      "admin",
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
 * Check user exist model
 * @param     :
 * @returns   :
 * @developer :
 */
authModel.checkEmailExist = async function (email) {
  let deferred = q.defer();

  if (email) {
    let emailObj = {
      uc_email: email,
    };

    let userData = await mongoHelper.getData(emailObj, "users_credential");

    if (userData) {
      deferred.resolve(userData);
    } else {
      deferred.resolve(false);
    }
  } else {
    deferred.resolve(false);
  }

  return deferred.promise;
};

/**
 * This function is using for get member List
 * @param     :
 * @returns   :
 * @developer :Vishal Kumar
 */

authModel.getMemberList = async function (body) {
  let deferred = q.defer();
  let MemberObj = {
    n_deleted: "0",
  };
  let MemberArray = await mongoHelper.getmemberListData(MemberObj, "admin_users", body);
  if (MemberArray && MemberArray.data && MemberArray.data.length > 0) {
    for (const result of MemberArray.data) {
      result.n_created = helper.dateFormat(result.n_created, "date");
    }

    deferred.resolve(MemberArray);
  } else {
    deferred.resolve([]);
  }

  return deferred.promise;
};
module.exports = authModel;
