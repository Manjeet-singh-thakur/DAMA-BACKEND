/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 
 * 
 * Written By  : anoop Kumar <anoop.zeroit@gmail.com>, May 2024
 * Description :
 * Modified By :
 */
const { json } = require("body-parser");
const q = require("q"),
  passwordHash = require("password-hash"),
  { v4 } = require("uuid"),
  helper = require("../helpers/index"),
  constants = require("../../../common/config/constants"),
  mongoHelper = require("../helpers/mongo_helper");
nodeMailer = require("nodemailer");
let homeObj = {};

/**
 * 
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.resource = async function (req, res) {
  res.render("resource", {});
};
/**
 * This function is using to get the total users,event,blogs,event in dashboard
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.index = async function (req, res) {
  let activeuserObj = {
    uc_active: "1",
    uc_deleted: "0"
  };
  let userObj = {
    uc_deleted: "0"
  };
  let planObj = {
    p_deleted: "0"
  };
  let activeplanObj = {
    p_active: "1",
    p_deleted: "0"
  };
  userData = await mongoHelper.getData(userObj, "users_credential");
  activeUserData = await mongoHelper.getData(activeuserObj, "users_credential");

  totalPlan = await mongoHelper.getData(planObj, "plan");
  totalActivePlan = await mongoHelper.getData(activeplanObj, "plan");

  let activeMemberObj = {
    au_active: "1",
    au_deleted: "0"
  }

  activeMemberData = await mongoHelper.getData(activeMemberObj, "admin_users");
  let newsObj = {
    n_deleted: "0",
  },
    totalnews = await mongoHelper.getData(newsObj, "news");

  let blogObj = {
    b_deleted: "0",
  },
    blogData = await mongoHelper.getData(blogObj, "blog");


  let resourceObj = {
    r_deleted: "0",
  },
    resourceData = await mongoHelper.getData(resourceObj, "resource");


  let eventObj = {
    e_deleted: "0",
  },
    eventData = await mongoHelper.getData(eventObj, "event");

  let resourcepurchaseObj = {
    r_type: "PAID",
  },
    resourcepurchaseData = await mongoHelper.getData(resourcepurchaseObj, "resource_purchase_detail");
    // console.log(JSON.stringify(resourcepurchaseData, null, 2) + "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
    let totalProfit = await mongoHelper.getTotalProfitDetail(resourcepurchaseData);
    let totalProfiteData = totalProfit ? totalProfit : 0;
    
  res.render("dashboard", { 
    data: {
      onlineUser: activeMemberData.length,
      plans: totalPlan.length,
      activePlans: totalActivePlan.length,
      activeUsers: activeUserData.length,
      totalUsers: userData.length,
      totalnews: totalnews.length,
      blogData: blogData.length,
      eventData: eventData.length,
      resourceData: resourceData.length,
      resourcepurchaseData: resourcepurchaseData.length,
      totalProfit:totalProfiteData
    },
  });
};

/**
 * This function is using to
 * @param     :
 * @returns   :
 * @developer :
 */
homeObj.managenewsListPage = async function (req, res) {
  res.render("managenewsList", {});
};

homeObj.news = async function (req, res) {
  res.render("news", {});
};

/**
 * This function is using to Blog Page list
 * @param     :
 * @returns   :
 * @developer : Sangeeta
 */

homeObj.manageblogListPage = async function (req, res) {
  res.render("blogList", {});
};


/**
 * This function is using to Blog Page list
 * @param     :
 * @returns   :
 * @developer : Sangeeta
 */

homeObj.manageresourceListPage = async function (req, res) {
  res.render("resourceList", {});
};

homeObj.blog = async function (req, res) {
  res.render("blog", {});
};
/**
 * This function is using to render  Event Page list
 * @param     :
 * @returns   :
 * @developer : Sangeeta
 */
homeObj.manageeventListPage = async function (req, res) {
  res.render("eventList", {});
};

homeObj.event = async function (req, res) {
  res.render("event", {});
};



/**
 * This function is using to render  member Page list
 * @param     :
 * @returns   :
 * @developer : Sangeeta
 */
homeObj.managememberListPage = async function (req, res) {
  res.render("managememberList", {});
};

homeObj.member = async function (req, res) {
  res.render("member", {});
};

/**
 * This function is using to render adminLogin
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.adminLogin = async function (req, res) {
  res.render("adminLogin", {});
};

/**
 * This function is using to render passwordForget
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.passwordForget = async function (req, res) {
  res.render("passwordForget", {});
};

/**
 * This function is using to render resetPassword
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.resetPassword = async function (req, res) {
  res.render("resetPassword", {});
};

/**
 * This function is using to render userPage
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.insertUserPage = async function (req, res) {
  res.render("insertUser", {});
};


/**
 * This function is using to render userPage
 * @param     :
 * @returns   :
 * @developer : Anoop
 */
homeObj.insertPaymentPage = async function (req, res) {
  res.render("insertPayment", {});
};

/**
 * This function is using to get userListPage
 * @param     :
 * @returns   :
 * @developer :Anoop
 */
homeObj.userListPage = async function (req, res) {
  res.render("userList", {});
};

/**
 * This function is using to changepasswordScreen
 * @param     :
 * @returns   :
 * @developer :Anoop
 */
homeObj.changePasswordPage = async function (req, res) {
  res.render("changePassword", {});
};

/**
 * This function is using to resetpwdScreen
 * @param     :
 * @returns   :
 * @developer :Anoop
 */
homeObj.resetpwdScreen = async function (req, res) {
  res.render("resetpwdScreen", {});
};

/**
 * This function is using to forgetpasswordScreen
 * @param     :
 * @returns   :
 * @developer :Anoop
 */
homeObj.forgetpasswordScreen = async function (req, res) {
  res.render("forgetpasswordScreen", {});
};

/**
 * This function is using to editProfile admin
 * @param     :
 * @returns   :
 * @developer :Anoop
 */
homeObj.editProfile = async function (req, res) {
  res.render("editProfile", {});
};

/**
 * This function is using to render verificationScreen
 * @param     :
 * @returns   :
 * @developer :
 */
homeObj.verificationScreen = async function (req, res) {
  res.render("verificationScreen", {});
};

/**
 * This function is using to
 * @param     :
 * @returns   :
 * @developer :
 */
homeObj.insertContactPage = async function (req, res) {
  res.render("insertContact", {});
};

/**
 * This function is using to
 * @param     :
 * @returns   :
 * @developer :
 */
homeObj.contactListPage = async function (req, res) {
  res.render("contactList",);
};


module.exports = homeObj;
