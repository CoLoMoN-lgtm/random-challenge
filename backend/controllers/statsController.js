const { Challenge, Category, User } = require('../models');

// Отримати загальну статистику
exports.getGeneralStats = async (req, res, next) => {
  try {
    const [
      totalChallenges,
      totalCategories,
      totalUsers,
      byCategory,
      byDifficulty,
      topRatedChallenges,
      mostCompletedChallenges
    ] = await Promise.all([
      // Загальна кількість викликів
      Challenge.countDocuments({ isActive: true }),
      
      // Загальна кількість категорій
      Category.countDocuments({ isActive: true }),
      
      // Загальна кількість користувачів
      User.countDocuments({ isActive: true }),
      
      // Виклики по категоріях
      Challenge.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }},
        { $unwind: '$category' },
        { $project: {
          categoryName: '$category.name',
          categoryEmoji: '$category.emoji',
          count: 1
        }},
        { $sort: { count: -1 } }
      ]),
      
      // Виклики по складності
      Challenge.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      
      // Топ викликів за рейтингом
      Challenge.find({ isActive: true, ratingCount: { $gt: 0 } })
        .sort('-rating')
        .limit(10)
        .select('text rating ratingCount categoryId')
        .populate('categoryId', 'name emoji'),
      
      // Найчастіше виконувані виклики
      Challenge.find({ isActive: true })
        .sort('-completedCount')
        .limit(10)
        .select('text completedCount categoryId')
        .populate('categoryId', 'name emoji')
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalChallenges,
          totalCategories,
          totalUsers
        },
        distributions: {
          byCategory,
          byDifficulty
        },
        topLists: {
          topRated: topRatedChallenges.map(ch => ({
            ...ch.toObject(),
            averageRating: ch.averageRating
          })),
          mostCompleted: mostCompletedChallenges
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Отримати статистику користувача
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: 'completedChallenges.challengeId',
        select: 'text difficulty categoryId',
        populate: {
          path: 'categoryId',
          select: 'name emoji'
        }
      });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Користувача не знайдено'
      });
    }
    
    // Аналіз виконаних викликів
    const completedByCategory = {};
    const completedByDifficulty = {
      easy: 0,
      medium: 0,
      hard: 0
    };
    
    let totalRating = 0;
    let ratedCount = 0;
    
    user.completedChallenges.forEach(cc => {
      if (cc.challengeId) {
        // По категоріях
        const categoryName = cc.challengeId.categoryId.name;
        if (!completedByCategory[categoryName]) {
          completedByCategory[categoryName] = 0;
        }
        completedByCategory[categoryName]++;
        
        // По складності
        completedByDifficulty[cc.challengeId.difficulty]++;
        
        // Рейтинг
        if (cc.rating) {
          totalRating += cc.rating;
          ratedCount++;
        }
      }
    });
    
    // Статистика по днях тижня
    const completedByDayOfWeek = [0, 0, 0, 0, 0, 0, 0];
    user.completedChallenges.forEach(cc => {
      const dayOfWeek = new Date(cc.completedAt).getDay();
      completedByDayOfWeek[dayOfWeek]++;
    });
    
    // Останні виконані виклики
    const recentChallenges = user.completedChallenges
      .slice(-10)
      .reverse()
      .filter(cc => cc.challengeId);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCompleted: user.stats.totalCompleted,
          currentStreak: user.stats.currentStreak,
          longestStreak: user.stats.longestStreak,
          averageRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 0,
          memberSince: user.createdAt
        },
        distributions: {
          byCategory: completedByCategory,
          byDifficulty: completedByDifficulty,
          byDayOfWeek: completedByDayOfWeek
        },
        recentActivity: recentChallenges.map(cc => ({
          challenge: cc.challengeId,
          completedAt: cc.completedAt,
          rating: cc.rating
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};