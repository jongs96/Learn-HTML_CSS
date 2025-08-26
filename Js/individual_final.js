// =================================================================
// 전역 변수 선언 및 플러그인 등록
// =================================================================
let heartRateChart, sleepChart;

if (window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
}

let systemSettings = {
    autoSync: true,
    syncInterval: 60,
    thresholds: { heartRate: { min: 60, max: 100 }, oxygen: { min: 95, max: 100 }, temperature: { min: 36.0, max: 37.5 }},
    notifications: { email: false, sms: false, push: true },
    dataRetention: 90,
    autoBackup: true,
    twoFactorAuth: false,
    sessionTimeout: 30
};

let connectedDevices = [
    { 
        id: 'DEV001', 
        name: 'Galaxy Watch 6', 
        registrantName: '김헬스',
        registrantContact: '010-1234-5678',
        managerName: '박케어',
        managerContact: '010-9876-5432',
        status: 'connected', 
        battery: 85, 
        lastSync: new Date(Date.now() - 1000 * 60 * 5) 
    },
    { 
        id: 'DEV002', 
        name: 'Apple Watch 9', 
        registrantName: '이영희',
        registrantContact: '010-1111-2222',
        managerName: '최관리',
        managerContact: '010-3333-4444',
        status: 'connected', 
        battery: 72, 
        lastSync: new Date(Date.now() - 1000 * 60 * 2) 
    }
];


// =================================================================
// 페이지 로드 시 실행될 메인 로직
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupPageRouting();
    initializeHomeDashboard();
    initializeSettings();
    initializeReportActions();
});


// =================================================================
// 페이지 전환(라우팅) 기능
// =================================================================
function setupPageRouting() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pageViews = document.querySelectorAll('.page-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.dataset.page;
            if (!pageId) return;

            pageViews.forEach(page => page.style.display = 'none');
            
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.style.display = 'flex';
            }

            if (pageId === 'reports') {
                renderReportCharts();
            }

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    document.querySelector('.nav-item[data-page="home"]').click();
}


// =================================================================
// 홈 대시보드 기능
// =================================================================
function initializeHomeDashboard() {
    initializeCharts();

    const elements = {
        heartRateValue: document.getElementById('current-heart-rate'),
        heartRateExplanation: document.getElementById('heart-rate-explanation'),
        tempValue: document.getElementById('current-temp'),
        tempExplanation: document.getElementById('temp-explanation'),
        oxygenValue: document.getElementById('current-oxygen'),
        oxygenExplanation: document.getElementById('oxygen-explanation'),
        heartRateStatusDot: document.getElementById('heart-rate-status-dot'),
        tempStatusDot: document.getElementById('temp-status-dot'),
        oxygenStatusDot: document.getElementById('oxygen-status-dot')
    };
    
    function updateHeartRate() {
        if (!elements.heartRateValue) return;
        const newValue = Math.floor(Math.random() * 70) + 60;
        elements.heartRateValue.textContent = `${newValue} bpm`;
        elements.heartRateExplanation.classList.remove('danger');
        elements.heartRateStatusDot.className = 'status-dot';
        if (newValue > 120) {
            elements.heartRateExplanation.textContent = '🚨 심박수가 매우 높습니다. 즉시 확인이 필요합니다.';
            elements.heartRateExplanation.classList.add('danger');
            elements.heartRateStatusDot.classList.add('status-danger');
        } else if (newValue > 100 || newValue < 60) {
            elements.heartRateExplanation.textContent = '⚠️ 심박수가 정상 범위를 벗어났습니다. 안정이 필요합니다.';
            elements.heartRateStatusDot.classList.add('status-warning');
        } else {
            elements.heartRateExplanation.textContent = '✅ 심박수가 안정적입니다.';
            elements.heartRateStatusDot.classList.add('status-normal');
        }
        const now = new Date();
        const newLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (heartRateChart) {
            heartRateChart.data.labels.push(newLabel);
            heartRateChart.data.datasets[0].data.push(newValue);
            if(heartRateChart.data.labels.length > 15) {
                heartRateChart.data.labels.shift();
                heartRateChart.data.datasets[0].data.shift();
            }
            heartRateChart.update('none');
        }
    }

    function updateTemperature() {
        if (!elements.tempValue) return;
        const newValue = (Math.random() * 2.5 + 36.0).toFixed(1);
        elements.tempValue.textContent = `${newValue}°C`;
        elements.tempExplanation.classList.remove('danger');
        elements.tempStatusDot.className = 'status-dot';
        if (newValue > 37.5) {
            elements.tempExplanation.textContent = '🚨 고열 상태입니다. 즉시 확인이 필요합니다.';
            elements.tempExplanation.classList.add('danger');
            elements.tempStatusDot.classList.add('status-danger');
        } else if (newValue < 36.2) {
            elements.tempExplanation.textContent = '⚠️ 저체온 가능성이 있습니다.';
            elements.tempStatusDot.classList.add('status-warning');
        } else {
            elements.tempExplanation.textContent = '✅ 체온이 정상 범위입니다.';
            elements.tempStatusDot.classList.add('status-normal');
        }
    }

    function updateOxygen() {
        if (!elements.oxygenValue) return;
        const newValue = Math.floor(Math.random() * 7) + 93;
        elements.oxygenValue.textContent = `${newValue}%`;
        elements.oxygenExplanation.classList.remove('danger');
        elements.oxygenStatusDot.className = 'status-dot';
        if (newValue < 95) {
            elements.oxygenExplanation.textContent = '🚨 산소 포화도가 낮습니다. 즉시 확인이 필요합니다.';
            elements.oxygenExplanation.classList.add('danger');
            elements.oxygenStatusDot.classList.add('status-danger');
        } else {
            elements.oxygenExplanation.textContent = '✅ 산소 포화도가 정상입니다.';
            elements.oxygenStatusDot.classList.add('status-normal');
        }
    }
    
    function setupMedicationChecklist() {
        const checkboxes = document.querySelectorAll('.med-checkbox');
        const medItems = document.querySelectorAll('.medication-item');
        const medStatusTextEl = document.getElementById('medication-status-text');
        if (!medStatusTextEl) return;
        
        function updateUI() {
            const checkedCount = document.querySelectorAll('.med-checkbox:checked').length;
            checkboxes.forEach((checkbox, index) => {
                medItems[index].classList.toggle('completed', checkbox.checked);
            });
            if (checkedCount === checkboxes.length) {
                medStatusTextEl.textContent = '✅ 오늘치 약을 모두 복용했습니다.';
            } else {
                medStatusTextEl.textContent = `복용할 약이 ${checkboxes.length - checkedCount}개 남았습니다.`;
            }
        }
        checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateUI));
        updateUI();
    }

    setInterval(() => {
        if (document.getElementById('page-home').style.display !== 'none') {
            updateHeartRate();
            updateTemperature();
            updateOxygen();
        }
    }, 3000);

    setupMedicationChecklist();
    updateHeartRate();
    updateTemperature();
    updateOxygen();
}


// =================================================================
// 차트 초기화 기능
// =================================================================
function initializeCharts() {
    const heartRateCanvas = document.getElementById('heartRateChart');
    if (heartRateCanvas && !heartRateChart) {
        heartRateChart = new Chart(heartRateCanvas.getContext('2d'), {
            type: 'line', 
            data: { labels: [], datasets: [{ label: '실시간 심박수', data: [], borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)', tension: 0.4, fill: true }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { y: { min: 50, max: 150 } }, 
                plugins: { 
                    legend: {
                        display: false
                    },
                    datalabels: {
                        display: false
                    }
                } 
            }
        });
    }

    const sleepCanvas = document.getElementById('sleepChart');
    if (sleepCanvas && !sleepChart) {
        sleepChart = new Chart(sleepCanvas.getContext('2d'), {
            type: 'line', 
            data: { labels: ['22:00', '00:00', '02:00', '04:00', '06:00'], datasets: [{ label: '수면 깊이', data: [1, 3, 4, 2, 1], borderColor: '#17a2b8', backgroundColor: 'rgba(23, 162, 184, 0.1)', tension: 0.4, fill: true }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: {
                        display: false
                    },
                    datalabels: { 
                        display: false 
                    } 
                }, 
                scales: { 
                    y: { 
                        min: 0, 
                        max: 5, 
                        ticks: { 
                            callback: v => ['깨어있음', '얕은수면', '코어수면', '깊은수면', 'REM수면'][v] || '' 
                        } 
                    } 
                } 
            }
        });
    }
}


// =================================================================
// 설정 페이지 기능
// =================================================================
function initializeSettings() {
    renderDeviceList();
    updateSettingsUI();

    const toggleSwitches = document.querySelectorAll('.toggle-switch');
    toggleSwitches.forEach(switchEl => {
        switchEl.addEventListener('click', () => {
            const checkbox = switchEl.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

function loadData() {
    const savedSettings = localStorage.getItem('individual-settings');
    if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        systemSettings = { ...systemSettings, ...parsed, thresholds: { ...systemSettings.thresholds, ...parsed.thresholds }, notifications: { ...systemSettings.notifications, ...parsed.notifications } };
    }
    const savedDevices = localStorage.getItem('connected-devices');
    if (savedDevices) {
        connectedDevices = JSON.parse(savedDevices);
    }
}

function saveSettings() {
    updateSettingsFromUI();
    localStorage.setItem('individual-settings', JSON.stringify(systemSettings));
    alert('설정이 저장되었습니다.');
}

function updateSettingsFromUI() {
    systemSettings = {
        autoSync: document.getElementById('auto-sync').checked,
        syncInterval: parseInt(document.getElementById('sync-interval').value),
        thresholds: {
            heartRate: { min: parseInt(document.getElementById('hr-min').value) || 60, max: parseInt(document.getElementById('hr-max').value) || 100 },
            oxygen: { min: parseInt(document.getElementById('o2-min').value) || 95, max: parseInt(document.getElementById('o2-max').value) || 100 },
            temperature: { min: parseFloat(document.getElementById('temp-min').value) || 36.0, max: parseFloat(document.getElementById('temp-max').value) || 37.5 }
        },
        notifications: {
            email: document.getElementById('email-notifications').checked,
            sms: document.getElementById('sms-notifications').checked,
            push: document.getElementById('push-notifications').checked
        },
        dataRetention: parseInt(document.getElementById('data-retention').value),
        autoBackup: document.getElementById('auto-backup').checked,
        twoFactorAuth: document.getElementById('two-factor-auth').checked,
        sessionTimeout: parseInt(document.getElementById('session-timeout').value)
    };
}

function updateSettingsUI() {
    document.getElementById('auto-sync').checked = systemSettings.autoSync;
    document.getElementById('sync-interval').value = systemSettings.syncInterval;
    document.getElementById('hr-min').value = systemSettings.thresholds.heartRate.min;
    document.getElementById('hr-max').value = systemSettings.thresholds.heartRate.max;
    document.getElementById('o2-min').value = systemSettings.thresholds.oxygen.min;
    document.getElementById('o2-max').value = systemSettings.thresholds.oxygen.max;
    document.getElementById('temp-min').value = systemSettings.thresholds.temperature.min;
    document.getElementById('temp-max').value = systemSettings.thresholds.temperature.max;
    document.getElementById('email-notifications').checked = systemSettings.notifications.email;
    document.getElementById('sms-notifications').checked = systemSettings.notifications.sms;
    document.getElementById('push-notifications').checked = systemSettings.notifications.push;
    document.getElementById('data-retention').value = systemSettings.dataRetention;
    document.getElementById('auto-backup').checked = systemSettings.autoBackup;
    document.getElementById('two-factor-auth').checked = systemSettings.twoFactorAuth;
    document.getElementById('session-timeout').value = systemSettings.sessionTimeout;
}

function resetSettings() {
    if (confirm('모든 설정을 기본값으로 복원하시겠습니까?')) {
        systemSettings = {
            autoSync: true, syncInterval: 60,
            thresholds: { heartRate: { min: 60, max: 100 }, oxygen: { min: 95, max: 100 }, temperature: { min: 36.0, max: 37.5 } },
            notifications: { email: false, sms: false, push: true },
            dataRetention: 90, autoBackup: true, twoFactorAuth: false, sessionTimeout: 30
        };
        updateSettingsUI();
        alert('설정이 기본값으로 복원되었습니다.');
    }
}

function renderDeviceList() {
    const deviceList = document.getElementById('device-list');
    if (!deviceList) return;
    deviceList.innerHTML = connectedDevices.map(device => `
        <div class="device-item">
            <div class="device-info">
                <div class="device-name">${device.name}</div>
                <div class="device-user-info">
                    <span><b>착용자:</b> ${device.registrantName} (${device.registrantContact})</span>
                    <span><b>관리자:</b> ${device.managerName} (${device.managerContact})</span>
                </div>
                <div class="device-status">
                    ${device.status === 'connected' ? '🟢 연결됨' : '🔴 연결 안됨'} | 
                    🔋 ${device.battery}% | 
                    마지막 동기화: ${new Date(device.lastSync).toLocaleTimeString('ko-KR')}
                </div>
            </div>
            <div class="device-actions"><button class="action-btn danger" onclick="removeDevice('${device.id}')">제거</button></div>
        </div>
    `).join('') || '<p>연결된 기기가 없습니다.</p>';
}

function removeDevice(deviceId) {
    if (confirm('정말로 이 기기를 제거하시겠습니까?')) {
        connectedDevices = connectedDevices.filter(d => d.id !== deviceId);
        localStorage.setItem('connected-devices', JSON.stringify(connectedDevices));
        renderDeviceList();
    }
}


// =================================================================
// 새 기기 등록 모달 기능
// =================================================================
function openAddDeviceModal() {
    document.getElementById('add-device-form').reset();
    document.getElementById('add-device-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('add-device-modal').style.display = 'none';
}

function handleSaveNewDevice() {
    const form = document.getElementById('add-device-form');
    const formData = new FormData(form);
    const deviceName = formData.get('deviceName');

    if (!deviceName || deviceName.trim() === '') {
        alert('기기 이름을 입력해주세요.');
        return;
    }

    const newDevice = {
        id: 'DEV' + Date.now().toString().slice(-4),
        name: deviceName.trim(),
        registrantName: formData.get('registrantName'),
        registrantContact: formData.get('registrantContact'),
        managerName: formData.get('managerName'),
        managerContact: formData.get('managerContact'),
        type: 'smartwatch',
        status: 'connected',
        battery: 100,
        lastSync: new Date()
    };
    connectedDevices.push(newDevice);

    localStorage.setItem('connected-devices', JSON.stringify(connectedDevices));
    
    renderDeviceList();
    closeModal();
    alert('새 기기 및 정보가 등록되었습니다.');
}


// =================================================================
// 리포트 페이지 기능
// =================================================================
function renderReportCharts() {
    ['weeklyHeartRate', 'weeklySleep', 'weeklyTemp', 'weeklySpo2'].forEach(id => {
        const chartInstance = Chart.getChart(id);
        if (chartInstance) {
            chartInstance.destroy();
        }
    });

    new Chart(document.getElementById("weeklyHeartRate"), {
        type: "line", data: { labels: ["월","화","수","목","금","토","일"], datasets: [{ label: "평균 심박수", data: [80,76,82,79,77,81,75], borderColor: "#007bff", backgroundColor: "rgba(0,123,255,0.1)", fill: true, tension: 0.35 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 60, max: 120 } }, plugins:{ legend:{ display:false }, datalabels: { anchor: 'end', align: 'top', color: '#000', font: { weight: 'bold' } } } }
    });
    
    new Chart(document.getElementById("weeklySleep"), {
        type: "bar", data: { labels: ["월","화","수","목","금","토","일"], datasets: [ { label: "깊은 수면", data: [1.0,1.2,1.1,0.9,1.0,1.3,1.1], backgroundColor: "#0056b3" }, { label: "코어 수면", data: [4.0,3.8,4.2,4.0,3.9,4.5,4.1], backgroundColor: "#007bff" }, { label: "REM", data: [1.5,1.4,1.6,1.2,1.3,1.7,1.5], backgroundColor: "#17a2b8" } ] },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } }, plugins:{ legend:{ display:false }, datalabels: { anchor: 'center', align: 'middle', color: '#FFFFFF', font: { weight: 'bold'} } } }
    });
    
    new Chart(document.getElementById("weeklyTemp"), {
        type: "bar", data: { labels: ["월","화","수","목","금","토","일"], datasets: [{ label: "평균 체온", data: [36.6,36.7,36.5,36.6,36.7,36.6,36.5], backgroundColor: "#ff6b6b" }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 36, max: 38 } }, plugins:{ legend:{ display:false }, datalabels: { anchor: 'end', align: 'top', color: '#000', font: { weight: 'bold' } } } }
    });
    
    new Chart(document.getElementById("weeklySpo2"), {
        type: "line", data: { labels: ["월","화","수","목","금","토","일"], datasets: [{ label: "SpO₂", data: [98,97,97,96,98,97,98], borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.08)", fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', color: '#000', font: { weight: 'bold' }, formatter: (v) => v + '%' } }, scales: { y: { suggestedMin: 94, suggestedMax: 100, ticks: { callback: v => v + "%" } } } }
    });
}

function initializeReportActions() {
    document.addEventListener("click", async (e) => {
        if (e.target.id === "pdf-btn") {
            const element = document.getElementById("page-reports");
            const opt = { margin: 0.5, filename: '주간_건강리포트.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
            html2pdf().set(opt).from(element).save();
        }
        
        if (e.target.id === "share-btn") {
            const element = document.getElementById("page-reports");
            const opt = { margin: 0.5, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        
            const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
        
            try {
                const file = new File([pdfBlob], '주간_건강리포트.pdf', { type: 'application/pdf' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ title: '주간 건강 리포트', text: '주간 건강 리포트를 공유합니다.', files: [file] });
                    return;
                }
            } catch (err) { /* 공유 실패 또는 취소 시 메일로 폴백 */ }
        
            const adminEmail = 'manager@example.com';
            const subject = encodeURIComponent('주간 건강 리포트 공유');
            const body = encodeURIComponent('첨부된 PDF를 확인해주세요.');
            window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
        }
    });
}