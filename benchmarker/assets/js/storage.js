(function(){
  const STORAGE_KEY = 'benchmarker_v1';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { users: {}, currentUser: null };
      const data = JSON.parse(raw);
      if (!data.users) data.users = {};
      return data;
    } catch (e) {
      return { users: {}, currentUser: null };
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function ensureUser(data, username) {
    if (!data.users[username]) {
      data.users[username] = {
        pinHash: null,
        stats: defaultStats()
      };
    }
  }

  function defaultStats() {
    return {
      reaction: { bestMs: null, attempts: 0, recentAverages: [] },
      numberMemory: { bestLevel: null, attempts: 0 },
      aim: { bestAvgMs: null, attempts: 0, recentAverages: [] },
      skillCheck: { bestScore: null, attempts: 0 }
    };
  }

  async function hashPin(pin) {
    // Cheap hash for demo (not secure); avoid crypto subtle for simplicity
    let h = 0;
    for (let i=0;i<pin.length;i++) h = (h*31 + pin.charCodeAt(i)) >>> 0;
    return String(h);
  }

  const api = {
    getCurrentUser() {
      const data = load();
      return data.currentUser ? { username: data.currentUser } : null;
    },
    logout() {
      const data = load();
      data.currentUser = null;
      save(data);
    },
    listUsers() {
      const data = load();
      return Object.keys(data.users).map(u => ({ username: u }));
    },
    async signupOrLogin(username, pin) {
      const data = load();
      ensureUser(data, username);
      const pinHash = await hashPin(pin);
      if (data.users[username].pinHash && data.users[username].pinHash !== pinHash) {
        throw new Error('Invalid PIN');
      }
      data.users[username].pinHash = pinHash;
      data.currentUser = username;
      save(data);
    },
    login(username, pin) {
      const data = load();
      if (!data.users[username]) return false;
      let h = 0; for (let i=0;i<pin.length;i++) h = (h*31 + pin.charCodeAt(i)) >>> 0;
      const pinHash = String(h);
      if (data.users[username].pinHash !== pinHash) return false;
      data.currentUser = username;
      save(data);
      return true;
    },
    deleteUser(username) {
      const data = load();
      delete data.users[username];
      if (data.currentUser === username) data.currentUser = null;
      save(data);
    },
    getUserStats(username) {
      const data = load();
      ensureUser(data, username);
      save(data);
      return data.users[username].stats;
    },
    recordReaction(username, results, averageMs) {
      const data = load();
      ensureUser(data, username);
      const s = data.users[username].stats.reaction;
      s.attempts += 1;
      if (s.bestMs == null || averageMs < s.bestMs) s.bestMs = averageMs;
      s.recentAverages.push(averageMs);
      if (s.recentAverages.length > 10) s.recentAverages.shift();
      save(data);
    },
    recordNumberMemory(username, levelAchieved) {
      const data = load();
      ensureUser(data, username);
      const s = data.users[username].stats.numberMemory;
      s.attempts += 1;
      if (s.bestLevel == null || levelAchieved > s.bestLevel) s.bestLevel = levelAchieved;
      save(data);
    },
    recordAim(username, avgMs) {
      const data = load();
      ensureUser(data, username);
      const s = data.users[username].stats.aim;
      s.attempts += 1;
      if (s.bestAvgMs == null || avgMs < s.bestAvgMs) s.bestAvgMs = avgMs;
      s.recentAverages.push(avgMs);
      if (s.recentAverages.length > 10) s.recentAverages.shift();
      save(data);
    },
    recordSkillCheck(username, score) {
      const data = load();
      ensureUser(data, username);
      const s = data.users[username].stats.skillCheck;
      s.attempts += 1;
      if (s.bestScore == null || score > s.bestScore) s.bestScore = score;
      save(data);
    }
  };

  window.BMStorage = api;
})();

