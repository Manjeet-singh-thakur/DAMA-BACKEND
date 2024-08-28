/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 *
 * Written By  : Anoop kumar <anoop.zeroit@gmail.com>, June 2024
 * Description :
 * Modified By :
 */
const q = require("q"),
  { v4 } = require("uuid"),
  helper = require("../helpers/index"),
  mongoHelper = require("../helpers/mongo_helper");
const newsModel = {};

/**
 *
 * This function is using to get the news details by newsId
 * @param     :
 * @returns   :
 * @developer : Anoop kumar
 *
 */
newsModel.getNewsDetail = async function (newsId, userId) {
  try {
    if (!newsId) {
      return false;
    }

    // Fetch news details
    let searchObj = {
      n_uuid: newsId,
    };

    let NewsDetails = await mongoHelper.getData(searchObj, "news");

    if (!NewsDetails || NewsDetails.length === 0) {
      return false;
    }

    // Fetch comments for the news
    let getCObj = {
      c_fk_type_uuid: newsId,
    };

    let commentDetails = await mongoHelper.getData(getCObj, "comment");

    // Fetch like data for the news
    if (userId) {
      let searchObj1 = {
        l_id: newsId,
        l_us_id: userId,
      };

      let data = await mongoHelper.getData(searchObj1, "like_data");

      NewsDetails[0].n_likedByMe = data.length > 0 ? 1 : 0;
    } else {
      NewsDetails[0].n_likedByMe = 0;
    }

    // Fetch user details for each comment
    for (let comment of commentDetails) {
      let getObj = { uc_uuid: comment.c_uc_uuid };
      console.log(comment.c_uc_uuid,"comment.c_uc_uuidcomment.c_uc_uuidcomment.c_uc_uuidcomment.c_uc_uuid")
      let userDetails = await mongoHelper.getData(getObj, "users_credential");
      console.log(userDetails,"oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo")
      if (userDetails && userDetails.length > 0) {
        const user = userDetails[0];
        comment.c_name = `${user.uc_first_name} ${user.uc_last_name}`;
        comment.c_profile_image = user.uc_profie_image;
        comment.c_institution = user.uc_proffesional_detail.uc_institution;
      }
    }

    // Sort comments by c_created timestamp in descending order (latest first)
    commentDetails.sort((a, b) => new Date(b.c_created) - new Date(a.c_created));

    // Add comment details directly to the NewsDetails array
    NewsDetails = NewsDetails.map(news => {
      news.comments = commentDetails.map(comment => ({
        c_uuid: comment.c_uuid,
        c_comment: comment.c_comment,
        c_created: comment.c_created,
        c_name: comment.c_name,
        c_profile_image: comment.c_profile_image,
        c_institution: comment.c_institution
      }));

      return news;
    });

    return NewsDetails;
  } catch (error) {
    return false;
  }
};


/**
 *
 * This function is using to get the all news list
 * @param     :
 * @returns   :
 * @developer : Anoop kumar
 *
 */
newsModel.getAllNewsList = async function (body, userId) {
  try {
    const page = parseInt(body.page);
    const pageSize = parseInt(body.pageSize);

    if (isNaN(page) || isNaN(pageSize) || pageSize < 1) {
      return { error: "Invalid page or pageSize", code: 200 };
    }

    const selectObj = {
      n_deleted: "0",
    };

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    let newsList = await mongoHelper.getpaginatedData(selectObj, "news", {
      skip,
      limit,
    });

    const totalNews = await mongoHelper.countData(selectObj, "news");
    const totalPages = Math.ceil(totalNews / pageSize);

    newsList.sort((a, b) => {
      return new Date(b.n_created) - new Date(a.n_created);
    });

    for (let news of newsList) {
      const newsId = news.n_uuid;
      let adminId = news.n_adminId;
      const searchObj = {
        l_id: newsId,
        l_us_id: userId,
      };
      let searchObj1 = {
        au_uuid: adminId,
      };

      const [likeData, adminData] = await Promise.all([
        mongoHelper.getData(searchObj, "like_data"),
        mongoHelper.getData(searchObj1, "admin_users"),
      ]);
      news.n_likedByMe = likeData.length > 0 ? 1 : 0;
      news.n_admimName =
        adminData[0].au_firstname + " " + adminData[0].au_lastname;
      news.n_role =
        adminData[0].au_role === "SUPER_ADMIN"
          ? "Super Admin"
          : adminData[0].au_role === "ADMIN"
          ? "Admin"
          : adminData[0].au_role === "MANAGER"
          ? "Manager"
          : adminData[0].au_role === "EDITOR"
          ? "Editor"
          : "";
      news.n_adminImage = adminData[0].au_profileImage || "";
    }

    return {
      data: newsList,
      currentPage: page,
      totalPages: totalPages,
      totalNews: totalNews,
    };
  } catch (error) {
    return { error: "Internal server error", code: 500 };
  }
};

module.exports = newsModel;
