import { supabase } from './supabase';

// Helper to get current week number (weeks since epoch)
export const getCurrentWeek = () => {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
};

export const getDayString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

export const getMonthString = (date = new Date()) => {
  return date.toISOString().slice(0, 7);
};

export const getWeekString = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
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

    // Fetch the question's tag and clinical area to update topic stats
    const { data: question } = await supabase
      .from('questions')
      .select('blueprint_tag, clinical_area')
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

    if (question && question.clinical_area) {
      if (!topicStats['__specialties']) topicStats['__specialties'] = {};
      const area = question.clinical_area;
      if (!topicStats['__specialties'][area]) {
        topicStats['__specialties'][area] = { total: 0, correct: 0 };
      }
      topicStats['__specialties'][area].total += 1;
      if (isCorrect) {
        topicStats['__specialties'][area].correct += 1;
      }
    }

    if (!topicStats['__timeline']) {
      topicStats['__timeline'] = { days: {}, weeks: {}, months: {} };
    }
    ['days', 'weeks', 'months'].forEach(type => {
      if (!topicStats['__timeline'][type]) topicStats['__timeline'][type] = {};
    });

    const timeline = topicStats['__timeline'];
    const dayStr = getDayString();
    const weekStr = getWeekString();
    const monthStr = getMonthString();

    if (!timeline.days[dayStr]) timeline.days[dayStr] = { total: 0, correct: 0 };
    if (!timeline.weeks[weekStr]) timeline.weeks[weekStr] = { total: 0, correct: 0 };
    if (!timeline.months[monthStr]) timeline.months[monthStr] = { total: 0, correct: 0 };

    timeline.days[dayStr].total += 1;
    timeline.weeks[weekStr].total += 1;
    timeline.months[monthStr].total += 1;

    if (isCorrect) {
      timeline.days[dayStr].correct += 1;
      timeline.weeks[weekStr].correct += 1;
      timeline.months[monthStr].correct += 1;
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

  getGlobalSpecialtyAverages: async () => {
    const { data: allStats, error } = await supabase
      .from('stats')
      .select('topic_stats');
      
    if (error) throw error;
    
    const globalAggregates = {};
    
    allStats.forEach(stat => {
      const specialties = stat.topic_stats?.['__specialties'] || {};
      Object.entries(specialties).forEach(([area, data]) => {
        if (!globalAggregates[area]) {
          globalAggregates[area] = { total: 0, correct: 0 };
        }
        globalAggregates[area].total += data.total;
        globalAggregates[area].correct += data.correct;
      });
    });
    
    const globalAverages = {};
    Object.entries(globalAggregates).forEach(([area, data]) => {
      if (data.total > 0) {
        globalAverages[area] = Math.round((data.correct / data.total) * 100);
      }
    });
    
    return globalAverages;
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
