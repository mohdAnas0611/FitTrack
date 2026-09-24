const { db, AVATAR_CONFIGS } = require('../db/database');
const { sanitizeUser } = require('./authController');

const getAvatars = async (req, res, next) => {
  try {
    const user = req.user ? db.findUserById(req.user.id) : null;
    const ownedList = user ? (user.ownedAvatars || ['blaze']) : ['blaze'];
    const selected = user ? user.selectedAvatar : 'blaze';

    const list = Object.entries(AVATAR_CONFIGS).map(([key, item]) => ({
      ...item,
      id: key,
      owned: ownedList.includes(key),
      equipped: selected === key,
    }));

    return res.status(200).json({
      success: true,
      userCoins: user ? user.coins : 0,
      avatars: list,
    });
  } catch (err) {
    next(err);
  }
};

const buyAvatar = async (req, res, next) => {
  try {
    const { avatarId } = req.body;
    const item = AVATAR_CONFIGS[avatarId];

    if (!item) {
      return res.status(404).json({ success: false, message: 'Avatar item not found' });
    }

    const user = db.findUserById(req.user.id);
    const owned = user.ownedAvatars || ['blaze'];

    if (owned.includes(avatarId)) {
      return res.status(400).json({ success: false, message: 'You already own this avatar!' });
    }

    if ((user.coins || 0) < item.price) {
      return res.status(400).json({
        success: false,
        message: `Not enough coins! You need ${item.price} coins, but have ${user.coins || 0} coins.`,
      });
    }

    const newCoins = (user.coins || 0) - item.price;
    const newOwned = [...owned, avatarId];
    const badges = [...(user.badges || [])];

    if (avatarId === 'legend' && !badges.includes('legend_buy')) {
      badges.push('legend_buy');
    }

    const updatedUser = db.updateUser(req.user.id, {
      coins: newCoins,
      ownedAvatars: newOwned,
      badges,
    });

    return res.status(200).json({
      success: true,
      message: `🎉 Unlocked ${item.name}!`,
      avatar: { ...item, id: avatarId, owned: true },
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

const equipAvatar = async (req, res, next) => {
  try {
    const { avatarId } = req.body;
    const item = AVATAR_CONFIGS[avatarId];

    if (!item) {
      return res.status(404).json({ success: false, message: 'Avatar item not found' });
    }

    const user = db.findUserById(req.user.id);
    const owned = user.ownedAvatars || ['blaze'];

    if (!owned.includes(avatarId)) {
      return res.status(403).json({
        success: false,
        message: 'You must purchase this avatar before equipping it!',
      });
    }

    const updatedUser = db.updateUser(req.user.id, {
      selectedAvatar: avatarId,
    });

    return res.status(200).json({
      success: true,
      message: `${item.name} equipped! ✨`,
      selectedAvatar: avatarId,
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvatars,
  buyAvatar,
  equipAvatar,
};
