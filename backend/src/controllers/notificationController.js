const { query } = require('../config/db');

async function getNotifications(req, res) {
  try {
    const notifications = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    const unreadCount = notifications.filter(n => n.is_read === 0 || n.is_read === false).length;

    return res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await query('UPDATE notifications SET is_read = 1 WHERE user_id = $1', [req.user.id]);
    } else {
      await query('UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
}

module.exports = { getNotifications, markAsRead };
