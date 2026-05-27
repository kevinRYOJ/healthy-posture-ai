function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function isValidDate(value) {
    return value && !Number.isNaN(new Date(value).getTime());
}

function calcHealthScore(sessions, user) {
    let baseScore = 100;

    // Denda berdasarkan data personalisasi profil user
    if (user && user.has_personalized) {
        const bmi = parseFloat(user.bmi);
        if (!isNaN(bmi)) {
            if (bmi > 30) baseScore -= 10;
            else if (bmi > 25) baseScore -= 5;
        }

        const sleep = parseFloat(user.sleep_hours);
        if (!isNaN(sleep)) {
            if (sleep < 5) baseScore -= 10;
            else if (sleep < 6) baseScore -= 5;
        }

        if (user.fitness_level === 'Low') baseScore -= 10;
        else if (user.fitness_level === 'Medium') baseScore -= 5;
    }

    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
        (s) => {
            const start = s.startTime || s.start || s.start_time;
            return start && isValidDate(start) && new Date(start).toDateString() === today;
        }
    );

    // Jika belum ada sesi duduk hari ini, skor hanya terpengaruh profil
    if (todaySessions.length === 0) return Math.min(100, Math.max(0, Math.round(baseScore)));

    // Hitung penalti dari sesi duduk
    let score = baseScore;
    for (const s of todaySessions) {
        const durationMin = toNumber(s.duration) / 60;
        const breaks = toNumber(s.breakTaken || s.breaksTaken);

        // Penalti progresif setiap 30 menit duduk
        if (durationMin > 30) score -= 5;
        if (durationMin > 60) score -= 10;
        if (durationMin > 90) score -= 15;
        if (durationMin > 120) score -= 10;

        // Penalti berat jika TIDAK ambil jeda sama sekali
        if (breaks === 0 && durationMin > 30) score -= 10;
        if (breaks === 0 && durationMin > 60) score -= 10; // tambahan -10 lagi

        // Bonus kecil jika rajin istirahat
        if (breaks > 0) score += 2;
        if (breaks >= 2) score += 3; // bonus tambahan jika >= 2 jeda
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = { calcHealthScore };
