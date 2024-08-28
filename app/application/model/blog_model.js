/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 
 * 
 * Written By  : Manjeet Thakur <manjeet@zeroitsolutions.com>, June 2024
 * Description :
 * Modified By :
 */

const e = require("express");
const mongoHelper = require("../helpers/mongo_helper");
const helper = require("../helpers");
const resourceModel = require("./resource_model");

const { v4 } = require("uuid");
let blogModel = {};
/**
 * This is for post blog comment
 * @param      :
 * @developer    : Manjeet Thakur
 */

blogModel.insertComment = async (Id, comment, userId, type) => {

console.log(`New blog comment -----------------------------: ${Id}`);
console.log(`New blog comment -----------------------------: ${comment}`);
console.log(`New blog comment -----------------------------: ${userId}`);
console.log(`New blog comment -----------------------------: ${type}`);
 

    if (Id && comment && userId && type) {
      console.log(`eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee blog comment --`);
      let uuid = v4(Date.now()),
      date = await helper.getUtcTime();

      let Count;
      if (type === "BLOG") {
        let blogComment = await mongoHelper.getData({ b_uuid: Id }, "blog");
        if (blogComment && blogComment.length > 0) {
          Count = parseInt(blogComment[0].b_commentCount);
          Count++;
           console.log(`New blog comment -----------------------------: ${Count}`);

          let updateCount = await mongoHelper.updateData(
            { b_uuid: Id },
            "blog",
            { b_commentCount: Count }
          );
           console.log(updateCount, "updateCount for blog-------------------------");
        }
      } else if (type === "NEWS") {
        let newsComment = await mongoHelper.getData({ n_uuid: Id }, "news");
        if (newsComment && newsComment.length > 0) {
          Count = parseInt(newsComment[0].n_commentCount);
          Count++;
          // // // // // console.log(`New news comment count: ${Count}`);

          let updateCount = await mongoHelper.updateData(
            { n_uuid: Id },
            "news",
            { n_commentCount: Count }
          );
          // // // // // console.log(updateCount, "updateCount for news");
        }
      }

      let insertObj = {
        c_uuid: uuid,
        c_fk_type_uuid: Id,
        c_comment: comment,
        c_uc_uuid: userId,
        c_type: type,
        c_created: date,
        c_updated: date,
      };
       console.log(insertObj, "insertobj------------------------------------------");
      let result = await mongoHelper.insert(insertObj, "comment");
    console.log(result, "result of insert--------------------------------");

      return result ? result : false;
    } else {
      // // // // // console.log("Missing parameters");
      return false;
    }
  
};

/**
 * for get comment list
 * @param    :
 * @developer   : Manjeet Thakur
 */

blogModel.getCommentListById = async (Id, type) => {
  if (Id) {
    let searchObj = {
      c_fk_type_uuid: Id,
      c_type: type,
    };
    let result = await mongoHelper.getData(searchObj, "comment");

    if (result) {
      // Extract unique user credentials IDs
      let uniqueUserIds = [...new Set(result.map(comment => comment.c_uc_uuid))];
      let userCredentials = {};

      // Fetch user credentials for each unique user ID
      for (let userId of uniqueUserIds) {
        let getObj = {
          uc_uuid: userId,
        };
        let res = await mongoHelper.getData(getObj, "users_credential");
        if (res && res.length > 0) {
          // Extract only the needed fields
          userCredentials[userId] = {
            c_name: `${res[0].uc_first_name} ${res[0].uc_last_name}`,
            c_profile_image: res[0].uc_profie_image,
            c_institution: res[0].uc_proffesional_detail.uc_institution
          };
        }
      }

      // Merge user credentials into the comments
      result = result.map(comment => {
        return {
          ...comment,
          c_name: userCredentials[comment.c_uc_uuid]?.c_name || null,
          c_profile_image: userCredentials[comment.c_uc_uuid]?.c_profile_image || null,
          c_institution: userCredentials[comment.c_uc_uuid]?.c_institution || null
        };
      });

      // Sort the result by creation date
      result.sort((a, b) => {
        return new Date(b.c_created) - new Date(a.c_created);
      });

      return result;
    } else {
      return false;
    }
  } else {
    return false;
  }
};




/**
 * for get blog list
 * @param   :
 * @developer   : Manjeet Thakur
 */
blogModel.getBlogList = async (body, userId) => {
  try {
    const page = parseInt(body.page);
    const pageSize = parseInt(body.pageSize);

    if (isNaN(page) || isNaN(pageSize) || pageSize < 1) {
      return { error: "Invalid page or pageSize", code: 200 };
    }

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const searchObj = {
      b_deleted: "0",
    };

    let result = await mongoHelper.getpaginatedData(searchObj, "blog", {
      skip,
      limit,
    });

    if (result) {
      const totalBlog = await mongoHelper.countData(searchObj, "blog");
      const totalPages = Math.ceil(totalBlog / pageSize);

      for (let blog of result) {
        const blogId = blog.b_uuid;
        const adminId = blog.b_adminId;
        const searchObj = {
          l_id: blogId,
          l_us_id: userId,
        };
        let searchObj1 = {
          au_uuid: adminId,
        };
        let [data, adminData] = await Promise.all([
          mongoHelper.getData(searchObj, "like_data"),
          mongoHelper.getData(searchObj1, "admin_users"),
        ]);

        blog.b_likedByMe = data.length > 0 ? 1 : 0;
        blog.b_admimName =
          adminData[0].au_firstname + " " + adminData[0].au_lastname;
        blog.b_role =
          adminData[0].au_role === "SUPER_ADMIN"
            ? "Super Admin"
            : adminData[0].au_role === "ADMIN"
            ? "Admin"
            : adminData[0].au_role === "MANAGER"
            ? "Manager"
            : adminData[0].au_role === "EDITOR"
            ? "Editor"
            : "";
        blog.b_adminImage = adminData[0].au_profileImage || "";
      }

      return {
        data: result,
        currentPage: page,
        totalPages: totalPages,
        totalBlog: totalBlog,
      };
    } else {
      return false;
    }
  } catch (error) {
    // // // // // // console.log(error);
    return false;
  }
};

/**
 * for get blog detailsById
 * @param    :
 * @developer   :  Manjeet Thakur
 */

blogModel.getBlogDetails = async (blogId, userId) => {
  if (!blogId) {
    return false;
  }

  let searchObj = {
    b_uuid: blogId,
  };
  console.log(searchObj, "searchObjsearchObjsearchObjsearchObjsearchObj");

  let BlogDetails = await mongoHelper.getData(searchObj, "blog");

  if (!BlogDetails || BlogDetails.length === 0) {
    return false;
  }

  let getCObj = {
    c_fk_type_uuid: blogId,
  };

  let commentDetails = await mongoHelper.getData(getCObj, "comment");

  if (userId) {
    let searchObj1 = {
      l_id: blogId,
      l_us_id: userId,
    };

    let data = await mongoHelper.getData(searchObj1, "like_data");

    BlogDetails[0].b_likedByMe = data.length > 0 ? 1 : 0;
  } else {
    BlogDetails[0].b_likedByMe = 0;
  }

  // Fetch user details for each comment
  for (let comment of commentDetails) {
    let getObj = { uc_uuid: comment.c_uc_uuid };
    let userDetails = await mongoHelper.getData(getObj, "users_credential");

    if (userDetails && userDetails.length > 0) {
      const user = userDetails[0];
      comment.c_name = `${user.uc_first_name} ${user.uc_last_name}`;
      comment.c_profile_image = user.uc_profie_image;
      // Check if uc_proffesional_detail exists
      if (user.uc_proffesional_detail) {
        comment.c_institution = user.uc_proffesional_detail.uc_institution;
      } else {
        comment.c_institution = null; // or any default value you prefer
      }
    }
  }

  // Sort comments by c_created timestamp in descending order (latest first)
  commentDetails.sort((a, b) => new Date(b.c_created) - new Date(a.c_created));

  // Add comment details directly to the BlogDetails array
  BlogDetails = BlogDetails.map(blog => {
    blog.comments = commentDetails.map(comment => ({
      c_uuid: comment.c_uuid,
      c_comment: comment.c_comment,
      c_created: comment.c_created,
      c_name: comment.c_name,
      c_profile_image: comment.c_profile_image,
      c_institution: comment.c_institution
    }));

    return blog;
  });

  console.log(BlogDetails, "BlogDetailsBlogDetailsBlogDetails");
  return BlogDetails;
};




/**
 * for rate article
 * @param   :
 * @developer   : Manjeet Thakur
 */

blogModel.giveRating = async (rating, id, comment, userId, type) => {
  try {

    let average = 0;
    let totalAverage;
    let insertObj = {
      _uuid: userId,
      _ruuid: id,
      _rating: rating,
      _comment: comment,
      _type: type,
    };
    let rateArticle = await mongoHelper.insert(insertObj, "rating");
    if (rateArticle) {
      if (type === "BLOG") {
     
        let searchObj = {
          _ruuid: id,
          _type: type,
        };
        
        let blogResult = await mongoHelper.getData(searchObj, "rating");

        if (blogResult && blogResult.length > 0) {
          blogResult.forEach((data) => {
            average += parseInt(data._rating);

          });
          totalAverage = average / blogResult.length;
        
          let updateAverageRating = await mongoHelper.updateData(
            { b_uuid: id },
            "blog",
            { b_avgRating: totalAverage }
          );
        
        }
      } else if (type === "NEWS") {
     
        let searchObj = {
          _ruuid: id,
          _type: type,
        };
      
        let newsResult = await mongoHelper.getData(searchObj, "rating");
     
        if (newsResult && newsResult.length > 0) {
          newsResult.forEach((data) => {
            average += parseInt(data._rating);
      
          });
          totalAverage = average / newsResult.length;

          let updateAverageRating = await mongoHelper.updateData(
            { n_uuid: id },
            "news",
            { n_avgRating: totalAverage }
          );

        }
      } else if (type === "EVENT") {
 
        let searchObj = {
          _ruuid: id,
          _type: type,
        };
   
        let eventResult = await mongoHelper.getData(searchObj, "rating");

        if (eventResult && eventResult.length > 0) {
          eventResult.forEach((data) => {
            average += parseInt(data._rating);
        
          });
          totalAverage = average / eventResult.length;
      
          let updateAverageRating = await mongoHelper.updateData(
            { e_uuid: id },
            "event",
            { e_avgRating: totalAverage }
          );
       
        }
      } else {
  
        let searchObj = {
          _ruuid: id,
          _type: type,
        };
        // // // // // console.log(searchObj, "search obj");
        let resourceResult = await mongoHelper.getData(searchObj, "rating");
        // // // // // console.log("resourceResult", resourceResult);
        if (resourceResult && resourceResult.length > 0) {
          resourceResult.forEach((data) => {
            average += parseInt(data._rating);
            // // // // // console.log(average, "average");
          });
          totalAverage = average / resourceResult.length;
          // // // // // console.log("totalaverage", totalAverage);
          let updateAverageRating = await mongoHelper.updateData(
            { r_uuid: id },
            "resource",
            { r_avgRating: totalAverage }
          );
          // // // // // console.log(updateAverageRating, "updateAverageRating");
        }
      }
      return rateArticle;
    } else {
      return false;
    }
  } catch (error) {
    // // // // // console.log(error);
    return false;
  }
};

/**
 * for insert like
 *
 * @param    :
 * @developer : Manjeet Thakur
 */

blogModel.like = async (Id, type, userId) => {
  try {
    let Count;

    if (type === "BLOG") {
      // // // // // console.log(`Fetching blog with ID: ${Id}`);

      const [blogLikeCount, likeData] = await Promise.all([
        mongoHelper.getData({ b_uuid: Id }, "blog"),
        mongoHelper.getData(
          { l_id: Id, l_us_id: userId, l_type: type },
          "like_data"
        ),
      ]);
      // // // // // console.log(likeData, "likeData");
      if (likeData && likeData.length > 0) {
        if (blogLikeCount && blogLikeCount.length > 0) {
          Count = parseInt(blogLikeCount[0].b_likeCount);
          // // // // // console.log(`Current blog like count: ${Count}`);
          Count--;

          // // // // // console.log(`New blog like count: ${Count}`);

          const updateLikeCountOfBlog = await mongoHelper.updateData(
            { b_uuid: Id },
            "blog",
            { b_likeCount: Count }
          );
          // // // // // console.log("updateLikeCountOfBlog:", updateLikeCountOfBlog);

          if (updateLikeCountOfBlog) {
            const data = await mongoHelper.deleteData(
              { l_id: Id, l_us_id: userId, l_type: type },
              "like_data"
            );
            if (data) {
              // // // // // console.log("Like data deleted successfully");
            }
            return updateLikeCountOfBlog;
          } else {
            return false;
          }
        }
      } else {
        if (blogLikeCount && blogLikeCount.length > 0) {
          Count = parseInt(blogLikeCount[0].b_likeCount);
          // // // // // console.log(`Current blog like count: ${Count}`);
          Count++;

          // // // // // console.log(`New blog like count: ${Count}`);

          const updateLikeCountOfBlog = await mongoHelper.updateData(
            { b_uuid: Id },
            "blog",
            { b_likeCount: Count }
          );
          // // // // // console.log("updateLikeCountOfBlog:", updateLikeCountOfBlog);

          if (updateLikeCountOfBlog) {
            const data = await mongoHelper.insert(
              { l_id: Id, l_us_id: userId, l_type: type },
              "like_data"
            );
            if (data) {
              // // // // // console.log("Like data inserted successfully");
            }
            return updateLikeCountOfBlog;
          } else {
            return false;
          }
        }
      }
    } else if (type === "NEWS") {
      // // // // // console.log(`Fetching news with ID: ${Id}`);

      const [newsLikeCount, likeData] = await Promise.all([
        mongoHelper.getData({ n_uuid: Id }, "news"),
        mongoHelper.getData(
          { l_id: Id, l_us_id: userId, l_type: type },
          "like_data"
        ),
      ]);

      // // // // // console.log("newsLikeCount:", newsLikeCount);
      // // // // // console.log(likeData, "likeData");
      if (likeData && likeData.length > 0) {
        if (newsLikeCount && newsLikeCount.length > 0) {
          Count = parseInt(newsLikeCount[0].n_likeCount);
          // // // // // console.log(`Current news like count: ${Count}`);
          Count--;

          // // // // // console.log(`New news like count: ${Count}`);

          const updateLikeCountOfNews = await mongoHelper.updateData(
            { n_uuid: Id },
            "news",
            { n_likeCount: Count }
          );
          // // // // // console.log("updateLikeCountOfNews:", updateLikeCountOfNews);

          if (updateLikeCountOfNews) {
            const data = await mongoHelper.deleteData(
              { l_id: Id, l_us_id: userId, l_type: type },
              "like_data"
            );
            if (data) {
              // // // // // console.log("Like data deleted successfully");
            }
            return updateLikeCountOfNews;
          } else {
            return false;
          }
        }
      } else {
        if (newsLikeCount && newsLikeCount.length > 0) {
          Count = parseInt(newsLikeCount[0].n_likeCount);
          // // // // // console.log(`Current news like count: ${Count}`);
          Count++;

          // // // // // console.log(`New news like count: ${Count}`);

          const updateLikeCountOfNews = await mongoHelper.updateData(
            { n_uuid: Id },
            "news",
            { n_likeCount: Count }
          );
          // // // // // console.log("updateLikeCountOfNews:", updateLikeCountOfNews);

          if (updateLikeCountOfNews) {
            const data = await mongoHelper.insert(
              { l_id: Id, l_us_id: userId, l_type: type },
              "like_data"
            );
            if (data) {
              // // // // // console.log("Like data inserted successfully");
            }
            return updateLikeCountOfNews;
          } else {
            return false;
          }
        }
      }
    }
  } catch (error) {
    // // // // // console.error("Error in like:", error);
    return false;
  }
};

module.exports = blogModel;
