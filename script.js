// Replace the entire script.js with this complete version

const sampleAlertsPage = [
    { ts: '2/28/2025, 10:30 AM', patientName: 'Sarah Johnson', score: 6, level: 'High', status: 'open' },
    { ts: '2/28/2025, 2:15 PM', patientName: 'Maria Garcia', score: 4, level: 'Moderate', status: 'monitoring' },
    { ts: '2/26/2025, 3:20 PM', patientName: 'Lisa Chen', score: 8, level: 'High', status: 'open' },
    { ts: '2/27/2025, 9:00 AM', patientName: 'Emma Davis', score: 2, level: 'Low', status: 'closed' },
    { ts: '2/25/2025, 4:45 PM', patientName: 'Priya Patel', score: 7, level: 'High', status: 'open' },
    { ts: '2/28/2025, 11:15 AM', patientName: 'Jessica Taylor', score: 5, level: 'Moderate', status: 'monitoring' },
    { ts: '2/24/2025, 1:30 PM', patientName: 'Amanda White', score: 9, level: 'High', status: 'open' },
    { ts: '2/27/2025, 3:00 PM', patientName: 'Rachel Brown', score: 3, level: 'Low', status: 'closed' },
    { ts: '2/26/2025, 10:00 AM', patientName: 'Victoria Lee', score: 6, level: 'High', status: 'monitoring' },
    { ts: '2/28/2025, 5:30 PM', patientName: 'Nicole Martinez', score: 4, level: 'Moderate', status: 'open' },
    { ts: '2/25/2025, 8:15 AM', patientName: 'Catherine Davis', score: 7, level: 'High', status: 'open' },
    { ts: '2/27/2025, 11:45 AM', patientName: 'Sophia Anderson', score: 2, level: 'Low', status: 'closed' },
    { ts: '2/28/2025, 6:00 AM', patientName: 'Olivia Harris', score: 5, level: 'Moderate', status: 'monitoring' },
    { ts: '2/26/2025, 2:30 PM', patientName: 'Isabella Thompson', score: 8, level: 'High', status: 'open' },
    { ts: '2/24/2025, 9:20 AM', patientName: 'Ava Robinson', score: 1, level: 'Low', status: 'closed' }
];

const RISK_ALGO_NAME = 'WHO Rule-Based Maternal Risk Detection Algorithm';
const SHOW_POPUP_RESULT = false; // set true if you want popup

(function () {
    function getStorage(key) {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); }
        catch (e) { return null; }
    }
    function setStorage(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

    let currentAlertFilter = {};
    let alertSort = { key: null, asc: true };

    function initSampleData() {
        if (getStorage('_sampleDataInitialized')) return;
        console.log('Initializing sample data...');

        // Sample patients
        const samplePatients = [
            { id: 'patient-001', name: 'Sarah Johnson', age: 28, weeks: 32, contact: '+1-555-0101', lastSeen: '2/28/2025, 10:30:00 AM' },
            { id: 'patient-002', name: 'Maria Garcia', age: 31, weeks: 28, contact: '+1-555-0102', lastSeen: '2/28/2025, 2:15:00 PM' },
            { id: 'patient-003', name: 'Emma Davis', age: 26, weeks: 24, contact: '+1-555-0103', lastSeen: '2/27/2025, 9:45:00 AM' },
            { id: 'patient-004', name: 'Lisa Chen', age: 35, weeks: 36, contact: '+1-555-0104', lastSeen: '2/26/2025, 3:20:00 PM' },
            { id: 'patient-005', name: 'Priya Patel', age: 29, weeks: 20, contact: '+1-555-0105', lastSeen: '2/27/2025, 11:00:00 AM' }
        ];
        setStorage('patients', samplePatients);

        // Sample vitals - CRITICAL: Make sure this is populated
        const sampleVitals = [
            { id: 'vital-001', patientId: 'patient-001', bp: '145/92', sugar: 155, weight: 72, fhr: 165, pulse: 88, symptoms: 'headache, swelling', prevGdm: 'yes', prevHyper: 'no', ts: '2/24/2025, 8:00:00 AM' },
            { id: 'vital-002', patientId: 'patient-001', bp: '140/90', sugar: 150, weight: 71, fhr: 160, pulse: 85, symptoms: 'headache', prevGdm: 'yes', prevHyper: 'no', ts: '2/25/2025, 9:30:00 AM' },
            { id: 'vital-003', patientId: 'patient-001', bp: '142/91', sugar: 152, weight: 71.5, fhr: 162, pulse: 86, symptoms: 'mild headache', prevGdm: 'yes', prevHyper: 'no', ts: '2/26/2025, 10:15:00 AM' },
            { id: 'vital-004', patientId: 'patient-001', bp: '138/88', sugar: 148, weight: 70, fhr: 158, pulse: 82, symptoms: 'headache', prevGdm: 'yes', prevHyper: 'no', ts: '2/27/2025, 11:00:00 AM' },
            { id: 'vital-005', patientId: 'patient-001', bp: '143/92', sugar: 156, weight: 72.5, fhr: 165, pulse: 88, symptoms: 'headache, swelling in feet', prevGdm: 'yes', prevHyper: 'no', ts: '2/28/2025, 8:30:00 AM' },
            { id: 'vital-006', patientId: 'patient-001', bp: '145/93', sugar: 158, weight: 73, fhr: 168, pulse: 90, symptoms: 'severe headache, swelling', prevGdm: 'yes', prevHyper: 'no', ts: '2/28/2025, 2:00:00 PM' },
            { id: 'vital-007', patientId: 'patient-001', bp: '140/89', sugar: 149, weight: 71, fhr: 159, pulse: 84, symptoms: 'mild headache', prevGdm: 'yes', prevHyper: 'no', ts: '2/28/2025, 4:30:00 PM' }
        ];
        setStorage('vitals', sampleVitals);

        // Sample alerts - with more data for patient-005
        const sampleAlerts = [
            { id: 'alert-001', patient: 'patient-001', patientName: 'Sarah Johnson', score: 6, level: 'High', factors: ['BP', 'Sugar', 'Headache'], ts: '2/28/2025, 10:30:00 AM', contacted: false, status: 'open' },
            { id: 'alert-002', patient: 'patient-002', patientName: 'Maria Garcia', score: 4, level: 'Moderate', factors: ['BP', 'Sugar'], ts: '2/28/2025, 2:15:00 PM', contacted: true, status: 'monitoring' },
            { id: 'alert-003', patient: 'patient-004', patientName: 'Lisa Chen', score: 8, level: 'High', factors: ['BP', 'Sugar', 'Headache', 'FHR'], ts: '2/26/2025, 3:20:00 PM', contacted: false, status: 'open' },
            
            // Patient-005 alerts (Priya Patel)
            { id: 'alert-004', patient: 'patient-005', patientName: 'Priya Patel', score: 2, level: 'Low', factors: ['Headache'], ts: '2/24/2025, 9:00:00 AM', contacted: false, status: 'closed' },
            { id: 'alert-005', patient: 'patient-005', patientName: 'Priya Patel', score: 3, level: 'Low', factors: ['Headache', 'FHR'], ts: '2/25/2025, 10:30:00 AM', contacted: true, status: 'closed' },
            { id: 'alert-006', patient: 'patient-005', patientName: 'Priya Patel', score: 4, level: 'Moderate', factors: ['BP', 'Headache'], ts: '2/26/2025, 2:15:00 PM', contacted: true, status: 'monitoring' },
            { id: 'alert-007', patient: 'patient-005', patientName: 'Priya Patel', score: 5, level: 'Moderate', factors: ['Sugar', 'Headache', 'FHR'], ts: '2/27/2025, 11:00:00 AM', contacted: true, status: 'monitoring' }
        ];
        setStorage('alerts', sampleAlerts);

        // Sample audit logs
        const sampleAuditLogs = [
            { who: 'admin', action: 'system initialized', when: '2/24/2025, 8:00:00 AM' },
            { who: 'admin', action: 'thresholds changed', when: '2/26/2025, 9:00:00 AM' },
            { who: 'patient-001', action: 'vitals submitted', when: '2/24/2025, 8:00:00 AM' },
            { who: 'patient-001', action: 'vitals submitted', when: '2/25/2025, 9:30:00 AM' },
            { who: 'patient-001', action: 'vitals submitted', when: '2/26/2025, 10:15:00 AM' },
            { who: 'patient-001', action: 'vitals submitted', when: '2/27/2025, 11:00:00 AM' },
            { who: 'patient-001', action: 'alert generated (High)', when: '2/28/2025, 10:31:00 AM' },
            { who: 'Dr. Smith', action: 'reviewed alert for patient-001', when: '2/28/2025, 10:30:00 AM' },
            { who: 'Dr. Smith', action: 'contacted patient-001', when: '2/28/2025, 11:00:00 AM' },
            { who: 'patient-002', action: 'vitals submitted', when: '2/27/2025, 9:00:00 AM' },
            { who: 'patient-002', action: 'alert generated (Moderate)', when: '2/27/2025, 9:01:00 AM' },
            { who: 'Dr. Chen', action: 'reviewed alert for patient-002', when: '2/27/2025, 9:15:00 AM' },
            { who: 'Dr. Chen', action: 'contacted patient-002', when: '2/27/2025, 3:00:00 PM' },
            { who: 'patient-003', action: 'vitals submitted', when: '2/27/2025, 9:45:00 AM' },
            { who: 'patient-004', action: 'vitals submitted', when: '2/28/2025, 3:20:00 PM' },
            { who: 'patient-004', action: 'alert generated (High)', when: '2/28/2025, 3:21:00 PM' },
            { who: 'Dr. Smith', action: 'reviewed alert for patient-004', when: '2/28/2025, 3:35:00 PM' },
            { who: 'patient-005', action: 'vitals submitted', when: '2/28/2025, 11:00:00 AM' },
            { who: 'admin', action: 'user login', when: '2/28/2025, 8:00:00 AM' },
            { who: 'admin', action: 'system backup completed', when: '2/28/2025, 12:00:00 AM' }
        ];
        setStorage('auditLogs', sampleAuditLogs);

        const sampleThresholdHistory = [
            { when: '2/24/2025, 8:00:00 AM', who: 'admin', previous: 'BP: 135, Sugar: 130, FHR: 155, Weight: 10', current: 'BP: 140, Sugar: 140, FHR: 160, Weight: 10', reason: 'Initial setup' },
            { when: '2/26/2025, 9:00:00 AM', who: 'admin', previous: 'BP: 140, Sugar: 140, FHR: 160, Weight: 10', current: 'BP: 140, Sugar: 140, FHR: 160, Weight: 12', reason: 'Adjusted weight gain limit' }
        ];
        setStorage('thresholdHistory', sampleThresholdHistory);

        setStorage('_sampleDataInitialized', true);
        console.log('Sample data initialized - vitals count:', sampleVitals.length);
    }

    if (!getStorage('thresholds')) {
        setStorage('thresholds', { bp: 140, sugar: 140, fhr: 160, weight: 10 });
    }
    if (!getStorage('doctors')) setStorage('doctors', [{ name: 'Dr. Smith' }, { name: 'Dr. Chen' }]);

    initSampleData();

    function classifyRisk(score) {
        if (score >= 6) return 'High';
        if (score >= 3) return 'Moderate';
        return 'Low';
    }

    function computeRisk(input) {
        let score = 0;
        const factors = [];
        const ts = new Date().toLocaleString();

        const systolic = Number(input.systolic || 0);
        const diastolic = Number(input.diastolic || 0);
        const sugar = Number(input.sugar || 0);
        const fhr = Number(input.fhr || 0);

        // BP > 140/90 => +2
        if (systolic > 140 || diastolic > 90) {
            score += 2;
            factors.push('High Blood Pressure');
        }

        // Sugar > 140 => +2
        if (sugar > 140) {
            score += 2;
            factors.push('High Blood Sugar');
        }

        // FHR < 110 or > 160 => +2
        if (fhr < 110 || fhr > 160) {
            score += 2;
            factors.push('Abnormal Fetal Heart Rate');
        }

        const selected = (input.symptomList || []).map(s => String(s).toLowerCase());
        const other = String(input.otherSymptoms || '').toLowerCase();

        const symptomRules = [
            { label: 'Severe Headache', points: 2, keys: ['severe headache'] },
            { label: 'Swelling in hands or feet', points: 2, keys: ['swelling in hands or feet', 'swelling'] },
            { label: 'Blurred vision', points: 2, keys: ['blurred vision'] },
            { label: 'Nausea or vomiting', points: 1, keys: ['nausea', 'vomiting'] },
            { label: 'Abdominal pain', points: 2, keys: ['abdominal pain', 'stomach pain'] },
            { label: 'Reduced fetal movement', points: 3, keys: ['reduced fetal movement', 'less fetal movement'] },
            { label: 'Dizziness', points: 1, keys: ['dizziness', 'dizzy'] },
            { label: 'Fever', points: 1, keys: ['fever'] }
        ];

        symptomRules.forEach(rule => {
            const fromCheckbox = selected.some(s => rule.keys.some(k => s.includes(k)));
            const fromText = rule.keys.some(k => other.includes(k));
            if (fromCheckbox || fromText) {
                score += rule.points;
                factors.push(`${rule.label} (+${rule.points})`);
            }
        });

        return {
            algorithm: RISK_ALGO_NAME,
            score,
            level: classifyRisk(score),
            factors,
            ts
        };
    }

    function saveRiskResult(patientId, risk, patientName = 'Patient') {
        const riskHistory = getStorage('riskHistory') || [];
        const entry = {
            id: `risk-${Date.now()}`,
            patientId,
            patientName,
            score: risk.score,
            level: risk.level,
            factors: risk.factors,
            algorithm: risk.algorithm,
            ts: risk.ts
        };
        riskHistory.push(entry);
        setStorage('riskHistory', riskHistory);

        // Auto-create doctor alert for Moderate or High
        if (risk.level === 'Moderate' || risk.level === 'High') {
            const alerts = getStorage('alerts') || [];
            alerts.push({
                id: `alert-${Date.now()}`,
                patient: patientId,
                patientName,
                score: risk.score,
                level: risk.level,
                factors: risk.factors,
                ts: risk.ts,
                contacted: false,
                status: risk.level === 'High' ? 'open' : 'monitoring'
            });
            setStorage('alerts', alerts);
        }
    }

    function getVitalStatus(value, min, max) {
        if (value < min) return 'Low';
        if (value > max) return 'High';
        return 'Normal';
    }

    function getOverallDisplayLevel(level) {
        // Display as High / Normal / Low (Moderate -> Normal)
        if (level === 'Moderate') return 'Normal';
        return level;
    }

    function renderSubmitResult(risk, values) {
        const box = document.getElementById('quick-result');
        const levelEl = document.getElementById('quick-level');
        const scoreEl = document.getElementById('quick-score');
        const factorsEl = document.getElementById('quick-factors');
        const vitalsEl = document.getElementById('quick-vitals');
        if (!box || !levelEl || !scoreEl || !factorsEl || !vitalsEl) return;

        const color = risk.level === 'High' ? '#dc2626' : risk.level === 'Moderate' ? '#f59e0b' : '#16a34a';
        levelEl.textContent = `${risk.level} Risk`;
        levelEl.style.color = color;
        scoreEl.textContent = String(risk.score);

        factorsEl.textContent = risk.factors.length
            ? `Contributing Factors: ${risk.factors.join(', ')}`
            : 'Contributing Factors: None';

        const status = (v, lo, hi) => (v < lo ? 'Low' : v > hi ? 'High' : 'Normal');
        vitalsEl.innerHTML = [
            `BP Systolic: <strong>${status(values.bpSys, 90, 140)}</strong>`,
            `BP Diastolic: <strong>${status(values.bpDia, 60, 90)}</strong>`,
            `Blood Sugar: <strong>${status(values.sugar, 70, 140)}</strong>`,
            `Weight: <strong>${status(values.weight, 45, 120)}</strong>`,
            `Pulse: <strong>${status(values.pulse, 60, 100)}</strong>`,
            `Fetal Heart Rate: <strong>${status(values.fhr, 110, 160)}</strong>`
        ].map(x => `<div>${x}</div>`).join('');

        box.style.display = 'block';
    }

    function renderPatientRiskPanel() {
        const page = location.pathname.split('/').pop().toLowerCase();
        if (page !== 'patient.html') return;

        const user = getStorage('user') || { id: 'patient-001', name: 'Patient' };
        const host = document.querySelector('.main-content.patient-dashboard') || document.querySelector('.main-content');
        if (!host) return;

        const history = (getStorage('riskHistory') || []).filter(r => r.patientId === user.id);
        const latest = history[history.length - 1];

        const panel = document.createElement('section');
        panel.className = 'card';
        panel.style.marginTop = '12px';

        if (!latest) {
            panel.innerHTML = `<h3>Risk Analysis</h3><div style="color:#6b7280">No submissions yet.</div>`;
            host.appendChild(panel);
            return;
        }

        const color = latest.level === 'High' ? '#dc2626' : latest.level === 'Moderate' ? '#f59e0b' : '#16a34a';

        const sevenDay = history.slice(-7);
        const bars = sevenDay.map(r => {
            const h = Math.max(10, Math.min(100, r.score * 12));
            const c = r.level === 'High' ? '#dc2626' : r.level === 'Moderate' ? '#f59e0b' : '#16a34a';
            return `<div title="${r.ts} | ${r.score}" style="width:18px;height:${h}px;background:${c};border-radius:4px"></div>`;
        }).join('');

        panel.innerHTML = `
            <h3>Risk Analysis</h3>
            <div>Risk Score: <strong>${latest.score}</strong></div>
            <div>Risk Level: <strong style="color:${color}">${latest.level}</strong></div>
            <div style="margin-top:6px;color:#6b7280">Factors: ${latest.factors.join(', ') || 'None'}</div>
            <div style="margin-top:10px"><strong>7-Day Risk Trend</strong></div>
            <div style="display:flex;align-items:flex-end;gap:6px;margin-top:8px;min-height:110px">${bars}</div>
        `;
        host.appendChild(panel);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('user'); location.reload(); });

        const page = location.pathname.split('/').pop().toLowerCase();
        const ui = document.getElementById('user-info');

        if (page === 'patient-vitals.html') {
            if (ui) ui.textContent = 'Patient';

            const form = document.getElementById('vitals-form');
            if (!form) return;

            form.addEventListener('submit', function (e) {
                e.preventDefault();

                const bpSys = Number(document.getElementById('bp-sys')?.value || 0);
                const bpDia = Number(document.getElementById('bp-dia')?.value || 0);
                const sugar = Number(document.getElementById('sugar')?.value || 0);
                const weight = Number(document.getElementById('weight')?.value || 0);
                const pulse = Number(document.getElementById('pulse')?.value || 0);
                const fhr = Number(document.getElementById('fhr')?.value || 0);

                const checkedSymptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(x => x.value);
                const otherSymptoms = (document.getElementById('other-symptoms')?.value || '').trim();
                const symptomText = [...checkedSymptoms, otherSymptoms].filter(Boolean).join(', ');

                const user = getStorage('user') || { id: 'patient-001', name: 'Patient' };

                const risk = computeRisk({
                    systolic: bpSys,
                    diastolic: bpDia,
                    sugar,
                    weight,
                    pulse,
                    fhr,
                    symptomList: checkedSymptoms,
                    otherSymptoms
                });

                const vitals = getStorage('vitals') || [];
                vitals.push({
                    id: `vital-${Date.now()}`,
                    patientId: user.id,
                    patientName: user.name,
                    bp: `${bpSys}/${bpDia}`,
                    sugar, weight, pulse, fhr,
                    symptoms: symptomText,
                    ts: new Date().toLocaleString()
                });
                setStorage('vitals', vitals);

                saveRiskResult(user.id, risk, user.name); // auto alerts for Moderate/High
                renderSubmitResult(risk, { bpSys, bpDia, sugar, weight, pulse, fhr });

                if (SHOW_POPUP_RESULT) {
                    alert(`Risk: ${risk.level}\nScore: ${risk.score}`);
                }
            });
        }

        renderPatientRiskPanel();
    });

    window.showPatientDetail = function(pId) {
        const patients = getStorage('patients') || [];
        const alerts = getStorage('alerts') || [];
        const p = patients.find(x => x.id === pId);
        const alert = alerts.find(a => a.patient === pId);
        const modal = document.getElementById('patient-detail-modal');
        if (modal && p) {
            const detailName = document.getElementById('detail-patient-name');
            const detailAge = document.getElementById('detail-age');
            const detailWeeks = document.getElementById('detail-weeks');
            const detailContact = document.getElementById('detail-contact');
            const detailScore = document.getElementById('detail-score');
            const detailLevel = document.getElementById('detail-level');
            const detailExplanation = document.getElementById('detail-explanation');

            if (detailName) detailName.textContent = p.name || pId;
            if (detailAge) detailAge.textContent = p.age || '—';
            if (detailWeeks) detailWeeks.textContent = p.weeks || '—';
            if (detailContact) detailContact.textContent = p.contact || '—';
            if (alert) {
                if (detailScore) detailScore.textContent = alert.score;
                if (detailLevel) detailLevel.innerHTML = alert.level;
                if (detailExplanation) detailExplanation.textContent = alert.factors.join(', ');
            } else {
                if (detailScore) detailScore.textContent = '0';
                if (detailLevel) detailLevel.innerHTML = 'Low';
                if (detailExplanation) detailExplanation.textContent = 'No risk factors';
            }
            if (modal) modal.style.display = '';
        }
    };

    window.getStorage = getStorage;

    // Authentication Check & Logout Handler
    (function() {
        // Check if user is logged in
        function checkAuth() {
            const user = localStorage.getItem('user');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            
            if (!user || isLoggedIn !== 'true') {
                // Not logged in, redirect to login page
                window.location.href = 'index.html';
                return false;
            }
            return true;
        }

        // Logout function
        function handleLogout() {
            // Clear all user data
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            
            // Redirect to login page
            window.location.href = 'index.html';
        }

        // Check authentication on page load
        checkAuth();

        // Attach logout handler to logout button
        document.addEventListener('DOMContentLoaded', function() {
            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.onclick = function(e) {
                    e.preventDefault();
                    handleLogout();
                };
            }
        });
    })();
})();