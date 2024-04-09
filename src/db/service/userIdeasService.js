const UserIdeas = require('../models/userIdeasModel');
const Idea = require('../models/ideaModel');

const findNewIdeaForUser = async (userId) => {
  const userIdObj = mongoose.Types.ObjectId(userId);

  const newIdea = await Idea.aggregate([
    {
      $lookup: {
        from: "userideas",
        let: { ideaId: "$_id" },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [ 
                  { $eq: ["$ideaId", "$$ideaId"] }, 
                  { $eq: ["$userId", userIdObj] }
                ]
              } 
            } 
          }
        ],
        as: "sentIdeas"
      }
    },
    {
      $match: {
        "sentIdeas": { $size: 0 }
      }
    },
    { $sort: { createdAt: 1 } },
    { $limit: 1 }
  ]);

  if (newIdea.length === 0) {
    throw new Error('Новые идеи не найдены');
  }

  return newIdea[0];
};

module.exports = {
  findNewIdeaForUser,
}