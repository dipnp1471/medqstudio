import { supabase } from './supabase';

// Helper to get current week number (weeks since epoch)
export const getCurrentWeek = () => {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
};

// API
export const db = {
  // --- USERS ---
  syncSupabaseUser: async (supabaseUser) => {
    const emailLower = supabaseUser.email.toLowerCase();
    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (checkError) throw checkError;
    
    if (existingUser) {
      return existingUser;
    }

    const randomAlias = `Doctor_${Math.floor(Math.random() * 10000)}`;

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        email: emailLower,
        alias: randomAlias,
        role: 'user'
      }])
      .select()
      .single();

    if (userError) throw userError;

    const { error: statsError } = await supabase
      .from('stats')
      .insert([{
        email: emailLower,
        history: [],
        total_answered: 0,
        correct_answered: 0,
        week_num: getCurrentWeek(),
        weekly_correct: 0,
        last_win_week: null,
        ratings: {},
        topic_stats: {}
      }]);

    if (statsError) throw statsError;

    return newUser;
  },

  updateUserAlias: async (email, newAlias) => {
    const { data: updated, error } = await supabase
      .from('users')
      .update({ alias: newAlias })
      .eq('email', email.toLowerCase())
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  },

  // --- STATS ---
  getUserStats: async (email) => {
    const { data: userStats, error } = await supabase
      .from('stats')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!userStats) return null;

    const currentWeek = getCurrentWeek();
    let needsUpdate = false;
    
    // Map snake_case to camelCase
    let updatedStats = {
      email: userStats.email,
      history: userStats.history || [],
      totalAnswered: userStats.total_answered || 0,
      correctAnswered: userStats.correct_answered || 0,
      weekNum: userStats.week_num || 0,
      weeklyCorrect: userStats.weekly_correct || 0,
      lastWinWeek: userStats.last_win_week,
      ratings: userStats.ratings || {},
      topicStats: userStats.topic_stats || {}
    };

    if (updatedStats.weekNum !== currentWeek) {
      updatedStats.weeklyCorrect = 0;
      updatedStats.weekNum = currentWeek;
      needsUpdate = true;
    }
    if (!updatedStats.topicStats) {
      updatedStats.topicStats = {};
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('stats')
        .update({
          weekly_correct: updatedStats.weeklyCorrect,
          week_num: updatedStats.weekNum,
          topic_stats: updatedStats.topicStats
        })
        .eq('email', email);
      if (updateError) throw updateError;
    }

    return updatedStats;
  },

  updateUserStats: async (email, { questionId, isCorrect }) => {
    const { data: userStats, error } = await supabase
      .from('stats')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !userStats) throw new Error("Stats record not found");

    const currentWeek = getCurrentWeek();
    let weekNum = userStats.week_num;
    let weeklyCorrect = userStats.weekly_correct;

    if (weekNum !== currentWeek) {
      weeklyCorrect = 0;
      weekNum = currentWeek;
    }

    const history = userStats.history || [];
    if (!history.includes(questionId)) {
      history.push(questionId);
    }

    let totalAnswered = (userStats.total_answered || 0) + 1;
    let correctAnswered = userStats.correct_answered || 0;
    if (isCorrect) {
      correctAnswered += 1;
      weeklyCorrect += 1;
    }

    // Fetch the question's tag to update topic stats
    const { data: question } = await supabase
      .from('questions')
      .select('blueprint_tag')
      .eq('id', questionId)
      .maybeSingle();

    const topicStats = userStats.topic_stats || {};
    if (question && question.blueprint_tag) {
      const tag = question.blueprint_tag;
      if (!topicStats[tag]) {
        topicStats[tag] = { total: 0, correct: 0 };
      }
      topicStats[tag].total += 1;
      if (isCorrect) {
        topicStats[tag].correct += 1;
      }
    }

    // Save updated stats back to DB
    const { data: updated, error: updateError } = await supabase
      .from('stats')
      .update({
        history,
        total_answered: totalAnswered,
        correct_answered: correctAnswered,
        week_num: weekNum,
        weekly_correct: weeklyCorrect,
        topic_stats: topicStats
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      email: updated.email,
      history: updated.history,
      totalAnswered: updated.total_answered,
      correctAnswered: updated.correct_answered,
      weekNum: updated.week_num,
      weeklyCorrect: updated.weekly_correct,
      lastWinWeek: updated.last_win_week,
      ratings: updated.ratings,
      topicStats: updated.topic_stats
    };
  },

  resetUserStats: async (email) => {
    const currentWeek = getCurrentWeek();
    const { data: updated, error: updateError } = await supabase
      .from('stats')
      .update({
        history: [],
        total_answered: 0,
        correct_answered: 0,
        week_num: currentWeek,
        weekly_correct: 0,
        topic_stats: {}
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      email: updated.email,
      history: updated.history,
      totalAnswered: updated.total_answered,
      correctAnswered: updated.correct_answered,
      weekNum: updated.week_num,
      weeklyCorrect: updated.weekly_correct,
      lastWinWeek: updated.last_win_week,
      ratings: updated.ratings,
      topicStats: updated.topic_stats
    };
  },

  rateQuestion: async (email, questionId, rating) => {
    const { data: userStats, error } = await supabase
      .from('stats')
      .select('ratings')
      .eq('email', email)
      .maybeSingle();

    if (error || !userStats) return;

    const ratings = userStats.ratings || {};
    ratings[questionId] = rating;

    await supabase
      .from('stats')
      .update({ ratings })
      .eq('email', email);
  },

  getAllStats: async () => {
    const { data, error } = await supabase
      .from('stats')
      .select('*');
    if (error) throw error;
    
    return data.map(s => ({
      email: s.email,
      history: s.history || [],
      totalAnswered: s.total_answered || 0,
      correctAnswered: s.correct_answered || 0,
      weekNum: s.week_num || 0,
      weeklyCorrect: s.weekly_correct || 0,
      lastWinWeek: s.last_win_week,
      ratings: s.ratings || {},
      topicStats: s.topic_stats || {}
    }));
  },

  // --- LEADERBOARD ---
  getLeaderboard: async () => {
    const currentWeek = getCurrentWeek();
    const { data: statsData, error: statsError } = await supabase
      .from('stats')
      .select('email, weekly_correct, week_num')
      .eq('week_num', currentWeek)
      .gt('weekly_correct', 0);

    if (statsError) throw statsError;

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('email, alias');

    if (usersError) throw usersError;

    const leaderboard = statsData
      .map(s => {
        const user = usersData.find(u => u.email === s.email);
        return {
          alias: user?.alias || 'Anonymous User',
          email: s.email,
          weeklyCorrect: s.weekly_correct
        };
      })
      .sort((a, b) => b.weeklyCorrect - a.weeklyCorrect);

    return leaderboard;
  },

  awardWeeklyWin: async (email) => {
    const currentWeek = getCurrentWeek();
    const { error } = await supabase
      .from('stats')
      .update({ last_win_week: currentWeek })
      .eq('email', email);
    if (error) throw error;
  },
  
  hasSubmitPrivilege: async (email) => {
    const { data: userStats, error } = await supabase
      .from('stats')
      .select('last_win_week')
      .eq('email', email)
      .maybeSingle();

    if (error || !userStats) return false;
    if (userStats.last_win_week === null) return false;
    
    const currentWeek = getCurrentWeek();
    return (currentWeek - userStats.last_win_week) <= 2;
  },

  // --- QUESTIONS ---
  getQuestions: async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  addQuestion: async (newQuestion) => {
    const { error } = await supabase
      .from('questions')
      .insert([newQuestion]);
    if (error) throw error;
    return db.getQuestions();
  },

  flagQuestion: async (questionId, flagText) => {
    const { data: question, error } = await supabase
      .from('questions')
      .select('flags')
      .eq('id', questionId)
      .maybeSingle();

    if (error || !question) throw new Error("Question not found");

    const flags = question.flags || [];
    const updatedFlags = [...flags, flagText];

    const { error: updateError } = await supabase
      .from('questions')
      .update({ flags: updatedFlags })
      .eq('id', questionId);

    if (updateError) throw updateError;
    return db.getQuestions();
  },

  updateQuestion: async (updatedQuestion) => {
    const { error } = await supabase
      .from('questions')
      .update(updatedQuestion)
      .eq('id', updatedQuestion.id);
    if (error) throw error;
    return db.getQuestions();
  },

  saveAllQuestions: async (newQuestions) => {
    const { error } = await supabase
      .from('questions')
      .upsert(newQuestions);
    if (error) throw error;
    return newQuestions;
  }
};
