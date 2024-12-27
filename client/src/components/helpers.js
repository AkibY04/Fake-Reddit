const minsToSec = 60
const hoursToSec = 3600
const daysToSec = 86400 
const monthsToSec = 2629440
const yearsToSec = 31557600

/**
* Converts a date object into a timestamp string.
*
* @param {Date} date - The date object to convert.
* @returns {string} The string representing the timestamp.
*/
export function timestamp(date, currentTime = new Date()) {
    date = new Date(date);
    // ensure proper type is passed
    if (!(date instanceof Date)) {
        throw new Error("Invalid argument type.")
    }
    
    let msElapsed = Math.abs(currentTime - date)
    let secondsElapsed = msElapsed / 1000
  
    switch (true) {
        case (secondsElapsed < minsToSec): // Seconds
            return Math.floor(secondsElapsed) + " second(s) ago";
        
        case (secondsElapsed < hoursToSec): // Minutes
            return Math.floor(secondsElapsed / minsToSec) + " minute(s) ago";
        
        case (secondsElapsed < daysToSec): // Hours
            return Math.floor(secondsElapsed / hoursToSec) + " hour(s) ago";
  
        case (secondsElapsed < monthsToSec): // Months
            return Math.floor(secondsElapsed / daysToSec) + " day(s) ago";
  
        case (secondsElapsed < yearsToSec): // Years
            return Math.floor(secondsElapsed / monthsToSec) + " month(s) ago";
  
        default: // Years
            return Math.floor(secondsElapsed / yearsToSec) + " year(s) ago";
  
    } // end switch
  
  } // end timestamp()

function countComments(comments, commentIDs) {
    if (!commentIDs || commentIDs.length === 0) {
        return 0;
    }

    let count = commentIDs.length;

    commentIDs.forEach(commentID => {
        const comment = comments.find(comment => comment._id === commentID);
        if (!comment) {
          return 0;
        }
        count += countComments(comments, comment.commentIDs);
    });

    return count;
}

export function countPostComments(comments, postObj) {
    let totalComments = 0;
    if (postObj.commentIDs.length > 0) {
        totalComments = countComments(comments, postObj.commentIDs);
    }

    return totalComments;
}

export function newPostSort(postsArr) {
    return postsArr.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
}

export function oldPostSort(postsArr) {
    return postsArr.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
}

export function findLatestCommentDate(commentID, currComments) {
    const comment = currComments.find(comment => comment._id === commentID);
    if (!comment) return new Date(0);
  
    let latestDate = new Date(comment.commentedDate);
  
    if (comment.commentIDs && comment.commentIDs.length > 0) {
      comment.commentIDs.forEach(replyID => {
        const replyDate = findLatestCommentDate(replyID, currComments);
  
        if (replyDate > latestDate) {
          latestDate = replyDate;
        }
      });
    }
  
    return latestDate;
}

export function activePostSort(postsArr, currComments) {
    return postsArr.sort((a, b) => {

        let latestCommentA = new Date(0);
        if (a.commentIDs && a.commentIDs.length > 0) {
          a.commentIDs.forEach(commentID => {
            const commentDate = findLatestCommentDate(commentID, currComments);
  
            if (commentDate > latestCommentA) {
              latestCommentA = commentDate;
            }
          });
        }
  
        let latestCommentB = new Date(0);
        if (b.commentIDs && b.commentIDs.length > 0) {
          b.commentIDs.forEach(commentID => {
            const commentDate = findLatestCommentDate(commentID, currComments);
  
            if (commentDate > latestCommentA) {
              latestCommentB = commentDate;
            }
          });
        }
  
        if (latestCommentA.getTime() === latestCommentB.getTime()) {
          return new Date(b.postedDate) - new Date(a.postedDate);
      }
  
        return latestCommentB - latestCommentA;
      });
}

export function matchesSearchTerms(searchTerms, content) {
  let hasMatch = false; 

  searchTerms.forEach(currTerm => {
    if (content.includes(currTerm)) {
      hasMatch = true;
    }
  });

  return hasMatch;
}

export function searchComments(searchTerms, commentIDs, currComments) {
  let hasMatch = false;

  commentIDs.forEach(currCommentID => {
    const comment = currComments.find(comment => comment._id === currCommentID);
    if (matchesSearchTerms(searchTerms, comment.content.toLowerCase(), currComments)) {
      hasMatch = true; 
    }

    hasMatch = searchComments(searchTerms, comment.commentIDs, currComments) || hasMatch;
  });

  return hasMatch;
}

export function getCommunityObjectByName(communities, name) {
  for (const community of communities) {
      if (community.name === name) {
          return community
      }  
  }

  return null;
}