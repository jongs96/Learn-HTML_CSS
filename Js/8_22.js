// 8_22.js (상단, 전역 함수)
function showLoadingSpinner() {
    const el = document.getElementById('loading-spinner');
    if (el) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
    }
}

function hideLoadingSpinner() {
    const el = document.getElementById('loading-spinner');
    if (el) {
        el.style.transition = 'opacity 0.3s ease';
        el.style.opacity = '0';
        // 트랜지션 후 DOM에서 제거
        setTimeout(() => el.remove(), 300);
    }
}

// ===== 전역 변수 및 초기화 =====
let patientData = [];
let filteredPatients = [];
let currentPage = 1;
const patientsPerPage = 10;
let isLoading = false;
let notifications = [];
let emergencyAlerts = [];

// 시뮬레이션을 위한 임시 환자 데이터
const mockPatients = [
    {
        id: 'P001',
        name: '김○○',
        room: '301A',
        ward: 'icu',
        age: 67,
        gender: 'M',
        status: 'critical',
        vitals: {
            heartRate: 45,
            oxygen: 88,
            temperature: 38.2,
            bloodPressure: '90/60',
            sleepHours: 3.2
        },
        lastUpdate: new Date(Date.now() - 1000 * 60 * 2),
        deviceBattery: 15,
        alerts: ['심박수 이상', '산소포화도 낮음']
    },
    {
        id: 'P002',
        name: '이○○',
        room: '205B',
        ward: 'general',
        age: 45,
        gender: 'F',
        status: 'warning',
        vitals: {
            heartRate: 105,
            oxygen: 94,
            temperature: 36.8,
            bloodPressure: '140/90',
            sleepHours: 5.5
        },
        lastUpdate: new Date(Date.now() - 1000 * 60 * 1),
        deviceBattery: 78,
        alerts: ['빈맥']
    },
    {
        id: 'P003',
        name: '박○○',
        room: '102C',
        ward: 'recovery',
        age: 34,
        gender: 'M',
        status: 'normal',
        vitals: {
            heartRate: 72,
            oxygen: 98,
            temperature: 36.5,
            bloodPressure: '120/80',
            sleepHours: 7.8
        },
        lastUpdate: new Date(Date.now() - 1000 * 30),
        deviceBattery: 92,
        alerts: []
    }
];

// ===== DOM 로드 완료 시 초기화 =====
document.addEventListener('DOMContentLoaded', function () {
    initializeSystem();
    startRealTimeUpdates();
    setupEventListeners();
});

// ===== 시스템 초기화 =====
function initializeSystem() {
    // 로딩 스피너 표시
    showLoadingSpinner();

    // 임시 데이터로 환자 정보 초기화
    patientData = [...mockPatients];

    // 추가 환자 데이터 생성 (시뮬레이션용)
    generateMockPatients();

    // 시간 업데이트 시작
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 알림 시스템 초기화
    initializeNotifications();

    // 환자 목록 렌더링
    renderPatients();

    // 헬스 카드 업데이트
    updateHealthCards();

    // 로딩 완료 후 스피너 숨김
    setTimeout(hideLoadingSpinner, 1500);
}

// ===== 추가 환자 데이터 생성 (시뮬레이션) =====
function generateMockPatients() {
    const names = ['최○○', '정○○', '강○○', '조○○', '윤○○', '임○○', '한○○', '오○○'];
    const wards = ['icu', 'general', 'recovery'];
    const statuses = ['normal', 'warning', 'critical'];

    for (let i = 4; i <= 189; i++) {
        const status = Math.random() < 0.8 ? 'normal' : (Math.random() < 0.7 ? 'warning' : 'critical');
        const patient = {
            id: `P${String(i).padStart(3, '0')}`,
            name: names[Math.floor(Math.random() * names.length)],
            room: `${Math.floor(Math.random() * 4) + 1}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
            ward: wards[Math.floor(Math.random() * wards.length)],
            age: Math.floor(Math.random() * 60) + 20,
            gender: Math.random() < 0.5 ? 'M' : 'F',
            status: status,
            vitals: generateRandomVitals(status),
            lastUpdate: new Date(Date.now() - Math.random() * 1000 * 60 * 10),
            deviceBattery: Math.floor(Math.random() * 100) + 1,
            alerts: generateRandomAlerts(status)
        };
        patientData.push(patient);
    }
}

// ===== 랜덤 바이탈 생성 =====
function generateRandomVitals(status) {
    let heartRate, oxygen, temperature;

    switch (status) {
        case 'critical':
            heartRate = Math.random() < 0.5 ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 50) + 120;
            oxygen = Math.floor(Math.random() * 5) + 85;
            temperature = Math.random() < 0.5 ? (Math.random() * 1.5 + 34.5) : (Math.random() * 2 + 38.5);
            break;
        case 'warning':
            heartRate = Math.random() < 0.5 ? Math.floor(Math.random() * 10) + 50 : Math.floor(Math.random() * 20) + 100;
            oxygen = Math.random() * 3 + 92;
            temperature = Math.random() * 1 + 36.0;
            break;
        default:
            heartRate = Math.floor(Math.random() * 40) + 60;
            oxygen = Math.floor(Math.random() * 6) + 95;
            temperature = Math.random() * 1.1 + 36.1;
    }

    return {
        heartRate: Math.round(heartRate),
        oxygen: Math.round(oxygen),
        temperature: Math.round(temperature * 10) / 10,
        bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70}`,
        sleepHours: Math.round((Math.random() * 5 + 4) * 10) / 10
    };
}

// ===== 랜덤 알림 생성 =====
function generateRandomAlerts(status) {
    const alerts = [];
    if (status === 'critical') {
        alerts.push('긴급상황', '의료진 필요');
    } else if (status === 'warning') {
        alerts.push('관찰 필요');
    }
    return alerts;
}

// ===== 현재 시간 업데이트 =====
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// ===== 이벤트 리스너 설정 =====
function setupEventListeners() {
    // 검색 기능
    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // 필터 기능
    const wardFilter = document.getElementById('ward-filter');
    const statusFilter = document.getElementById('status-filter');

    if (wardFilter) wardFilter.addEventListener('change', handleFilter);
    if (statusFilter) statusFilter.addEventListener('change', handleFilter);

    // 메뉴 아이템 클릭
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.dataset.page;
            switchPage(page);
        });
    });

    // 뷰 모드 변경
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const view = this.dataset.view;
            changeViewMode(view);
        });
    });

    // 페이지네이션
    const pageButtons = document.querySelectorAll('.page-btn, .page-num');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const page = this.dataset.page || this.textContent;
            changePage(page);
        });
    });
}

// ===== 환자 목록 렌더링 =====
function renderPatients() {
    const patientList = document.getElementById('patient-list');
    if (!patientList) return;

    // 필터링된 환자 목록 가져오기
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = startIndex + patientsPerPage;
    const patientsToShow = filteredPatients.length > 0 ? filteredPatients : patientData;
    const currentPatients = patientsToShow.slice(startIndex, endIndex);

    patientList.innerHTML = '';

    currentPatients.forEach(patient => {
        const patientCard = createPatientCard(patient);
        patientList.appendChild(patientCard);
    });

    // 페이지네이션 업데이트
    updatePagination(patientsToShow.length);
}

// ===== 환자 카드 생성 =====
function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = `patient-card status-${patient.status}`;
    card.dataset.patientId = patient.id;

    const statusText = {
        normal: '정상',
        warning: '주의',
        critical: '위험'
    };

    const genderText = patient.gender === 'M' ? '남' : '여';
    const timeDiff = Math.floor((Date.now() - patient.lastUpdate) / (1000 * 60));

    card.innerHTML = `
        <div class="patient-header">
            <div class="patient-info">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-details">
                    <span class="room">${patient.room}</span>
                    <span class="age-gender">${patient.age}세 ${genderText}</span>
                    <span class="status-badge status-${patient.status}">${statusText[patient.status]}</span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="action-btn detail" onclick="showPatientDetail('${patient.id}')" title="상세보기">
                    <span class="icon">👁️</span>
                </button>
                <button class="action-btn alert" onclick="sendAlert('${patient.id}')" title="알림">
                    <span class="icon">🔔</span>
                </button>
            </div>
        </div>
        
        <div class="patient-vitals">
            <div class="vital-item">
                <span class="vital-label">심박수</span>
                <span class="vital-value ${getVitalStatus('heartRate', patient.vitals.heartRate)}">${patient.vitals.heartRate} BPM</span>
            </div>
            <div class="vital-item">
                <span class="vital-label">산소포화도</span>
                <span class="vital-value ${getVitalStatus('oxygen', patient.vitals.oxygen)}">${patient.vitals.oxygen}%</span>
            </div>
            <div class="vital-item">
                <span class="vital-label">체온</span>
                <span class="vital-value ${getVitalStatus('temperature', patient.vitals.temperature)}">${patient.vitals.temperature}°C</span>
            </div>
            <div class="vital-item">
                <span class="vital-label">혈압</span>
                <span class="vital-value">${patient.vitals.bloodPressure}</span>
            </div>
        </div>
        
        <div class="patient-footer">
            <div class="device-info">
                <span class="battery ${patient.deviceBattery < 20 ? 'low' : ''}">
                    🔋 ${patient.deviceBattery}%
                </span>
                <span class="last-update">
                    ${timeDiff}분 전 업데이트
                </span>
            </div>
            ${patient.alerts.length > 0 ? `
                <div class="patient-alerts">
                    ${patient.alerts.map(alert => `<span class="alert-tag">${alert}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

// ===== 바이탈 상태 확인 =====
function getVitalStatus(type, value) {
    switch (type) {
        case 'heartRate':
            if (value < 60 || value > 100) return 'critical';
            if (value < 70 || value > 90) return 'warning';
            return 'normal';
        case 'oxygen':
            if (value < 90) return 'critical';
            if (value < 95) return 'warning';
            return 'normal';
        case 'temperature':
            if (value < 35 || value > 38.5) return 'critical';
            if (value < 36 || value > 37.5) return 'warning';
            return 'normal';
        default:
            return 'normal';
    }
}

// ===== 헬스 카드 업데이트 =====
function updateHealthCards() {
    const stats = calculateHealthStats();

    // 산소포화도 카드
    updateHealthCard('oxygen', {
        average: stats.oxygen.average,
        normal: stats.oxygen.normal,
        warning: stats.oxygen.warning,
        critical: stats.oxygen.critical
    });

    // 심박수 카드
    updateHealthCard('heartrate', {
        average: stats.heartRate.average,
        normal: stats.heartRate.normal,
        warning: stats.heartRate.warning,
        critical: stats.heartRate.critical
    });

    // 체온 카드
    updateHealthCard('temperature', {
        average: stats.temperature.average,
        normal: stats.temperature.normal,
        warning: stats.temperature.warning,
        critical: stats.temperature.critical
    });

    // 수면 카드
    updateHealthCard('sleep', {
        average: stats.sleep.average,
        normal: stats.sleep.sufficient,
        warning: stats.sleep.insufficient,
        critical: stats.sleep.insomnia
    });
}

// ===== 건강 통계 계산 =====
function calculateHealthStats() {
    const totalPatients = patientData.length;

    const stats = {
        oxygen: { total: 0, normal: 0, warning: 0, critical: 0 },
        heartRate: { total: 0, normal: 0, warning: 0, critical: 0 },
        temperature: { total: 0, normal: 0, warning: 0, critical: 0 },
        sleep: { total: 0, sufficient: 0, insufficient: 0, insomnia: 0 }
    };

    patientData.forEach(patient => {
        const vitals = patient.vitals;

        // 산소포화도
        stats.oxygen.total += vitals.oxygen;
        const oxygenStatus = getVitalStatus('oxygen', vitals.oxygen);
        stats.oxygen[oxygenStatus]++;

        // 심박수
        stats.heartRate.total += vitals.heartRate;
        const heartRateStatus = getVitalStatus('heartRate', vitals.heartRate);
        stats.heartRate[heartRateStatus]++;

        // 체온
        stats.temperature.total += vitals.temperature;
        const tempStatus = getVitalStatus('temperature', vitals.temperature);
        stats.temperature[tempStatus]++;

        // 수면
        stats.sleep.total += vitals.sleepHours;
        if (vitals.sleepHours >= 7) stats.sleep.sufficient++;
        else if (vitals.sleepHours >= 5) stats.sleep.insufficient++;
        else stats.sleep.insomnia++;
    });

    return {
        oxygen: {
            average: (stats.oxygen.total / totalPatients).toFixed(1),
            normal: stats.oxygen.normal,
            warning: stats.oxygen.warning,
            critical: stats.oxygen.critical
        },
        heartRate: {
            average: Math.round(stats.heartRate.total / totalPatients),
            normal: stats.heartRate.normal,
            warning: stats.heartRate.warning,
            critical: stats.heartRate.critical
        },
        temperature: {
            average: (stats.temperature.total / totalPatients).toFixed(1),
            normal: stats.temperature.normal,
            warning: stats.temperature.warning,
            critical: stats.temperature.critical
        },
        sleep: {
            average: (stats.sleep.total / totalPatients).toFixed(1),
            sufficient: stats.sleep.sufficient,
            insufficient: stats.sleep.insufficient,
            insomnia: stats.sleep.insomnia
        }
    };
}

// ===== 개별 헬스 카드 업데이트 =====
function updateHealthCard(type, data) {
    const card = document.querySelector(`.health-card.${type}`);
    if (!card) return;

    const valueElement = card.querySelector('.value-number');
    const normalElement = card.querySelector('.detail-value.normal');
    const warningElement = card.querySelector('.detail-value.warning');
    const criticalElement = card.querySelector('.detail-value.critical');

    if (valueElement) {
        animateValue(valueElement, data.average);
    }

    if (normalElement) {
        const percentage = ((data.normal / patientData.length) * 100).toFixed(1);
        normalElement.textContent = `${data.normal}명 (${percentage}%)`;
    }

    if (warningElement) {
        const percentage = ((data.warning / patientData.length) * 100).toFixed(1);
        warningElement.textContent = `${data.warning}명 (${percentage}%)`;
    }

    if (criticalElement) {
        const percentage = ((data.critical / patientData.length) * 100).toFixed(1);
        criticalElement.textContent = `${data.critical}명 (${percentage}%)`;
    }
}

// ===== 값 애니메이션 =====
function animateValue(element, targetValue) {
    const startValue = parseFloat(element.textContent) || 0;
    const increment = (targetValue - startValue) / 20;
    let currentValue = startValue;

    const timer = setInterval(() => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= targetValue) ||
            (increment < 0 && currentValue <= targetValue)) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = typeof targetValue === 'string' ?
            currentValue.toFixed(1) : Math.round(currentValue);
    }, 50);
}

// ===== 검색 기능 =====
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();

    if (query === '') {
        filteredPatients = [];
    } else {
        filteredPatients = patientData.filter(patient =>
            patient.name.toLowerCase().includes(query) ||
            patient.room.toLowerCase().includes(query) ||
            patient.id.toLowerCase().includes(query)
        );
    }

    currentPage = 1;
    renderPatients();
}

// ===== 필터링 기능 =====
function handleFilter() {
    const wardFilter = document.getElementById('ward-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    filteredPatients = patientData.filter(patient => {
        const wardMatch = wardFilter === 'all' || patient.ward === wardFilter;
        const statusMatch = statusFilter === 'all' || patient.status === statusFilter;
        return wardMatch && statusMatch;
    });

    currentPage = 1;
    renderPatients();
}

// ===== 실시간 업데이트 시작 =====
function startRealTimeUpdates() {
    // 5초마다 랜덤하게 환자 데이터 업데이트
    setInterval(() => {
        updateRandomPatientData();
        renderPatients();
        updateHealthCards();
        updateSystemStatus();
    }, 5000);

    // 30초마다 새로운 알림 생성
    setInterval(() => {
        generateRandomNotification();
    }, 30000);
}

// ===== 랜덤 환자 데이터 업데이트 =====
function updateRandomPatientData() {
    const randomPatients = patientData
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 1);

    randomPatients.forEach(patient => {
        // 바이탈 사인 약간 변경
        patient.vitals.heartRate += Math.floor(Math.random() * 10) - 5;
        patient.vitals.oxygen += Math.floor(Math.random() * 4) - 2;
        patient.vitals.temperature += (Math.random() * 0.6) - 0.3;

        // 범위 제한
        patient.vitals.heartRate = Math.max(40, Math.min(150, patient.vitals.heartRate));
        patient.vitals.oxygen = Math.max(80, Math.min(100, patient.vitals.oxygen));
        patient.vitals.temperature = Math.max(34, Math.min(42, patient.vitals.temperature));
        patient.vitals.temperature = Math.round(patient.vitals.temperature * 10) / 10;

        // 배터리 감소
        patient.deviceBattery = Math.max(0, patient.deviceBattery - Math.floor(Math.random() * 2));

        // 업데이트 시간 갱신
        patient.lastUpdate = new Date();

        // 상태 재계산
        updatePatientStatus(patient);
    });
}

// ===== 환자 상태 업데이트 =====
function updatePatientStatus(patient) {
    const heartRateStatus = getVitalStatus('heartRate', patient.vitals.heartRate);
    const oxygenStatus = getVitalStatus('oxygen', patient.vitals.oxygen);
    const tempStatus = getVitalStatus('temperature', patient.vitals.temperature);

    if (heartRateStatus === 'critical' || oxygenStatus === 'critical' || tempStatus === 'critical') {
        patient.status = 'critical';
        if (Math.random() < 0.3) {
            createEmergencyAlert(patient);
        }
    } else if (heartRateStatus === 'warning' || oxygenStatus === 'warning' || tempStatus === 'warning') {
        patient.status = 'warning';
    } else {
        patient.status = 'normal';
    }

    // 알림 업데이트
    patient.alerts = [];
    if (heartRateStatus !== 'normal') {
        patient.alerts.push(patient.vitals.heartRate > 100 ? '빈맥' : '서맥');
    }
    if (oxygenStatus !== 'normal') {
        patient.alerts.push('산소포화도 이상');
    }
    if (tempStatus !== 'normal') {
        patient.alerts.push(patient.vitals.temperature > 37.5 ? '고열' : '저체온');
    }
    if (patient.deviceBattery < 20) {
        patient.alerts.push('배터리 부족');
    }
}

// ===== 응급상황 알림 생성 =====
function createEmergencyAlert(patient) {
    const alert = {
        id: Date.now(),
        patientId: patient.id,
        patientName: patient.name,
        room: patient.room,
        type: 'emergency',
        message: `${patient.name} (${patient.room}) 긴급상황 발생`,
        timestamp: new Date(),
        vitals: { ...patient.vitals }
    };

    emergencyAlerts.unshift(alert);
    showEmergencyModal(alert);
    addNotification({
        type: 'emergency',
        title: '긴급상황 발생',
        message: alert.message,
        timestamp: new Date()
    });
}

// ===== 응급상황 모달 표시 =====
function showEmergencyModal(alert) {
    // 응급알림 모달을 잠시 비활성화
    console.log('응급상황 발생:', alert);
    
    // 모달 대신 콘솔에 로그만 출력
    // const modal = document.getElementById('emergency-modal');
    // const details = document.getElementById('emergency-details');
    // 
    // if (modal && details) {
    //     details.innerHTML = `
    //         <div class="emergency-patient">
    //             <h3>${alert.patientName}</h3>
    //             <p>병실: ${alert.room}</p>
    //         </div>
    //         <div class="emergency-vitals">
    //             <div class="vital-emergency">심박수: <strong>${alert.vitals.heartRate} BPM</strong></div>
    //             <div class="vital-emergency">산소포화도: <strong>${alert.vitals.oxygen}%</strong></div>
    //             <div class="vital-emergency">체온: <strong>${alert.vitals.temperature}°C</strong></div>
    //             <div class="vital-emergency">혈압: <strong>${alert.vitals.bloodPressure}</strong></div>
    //         </div>
    //         <div class="emergency-time">
    //             발생시간: ${alert.timestamp.toLocaleTimeString('ko-KR')}
    //         </div>
    //     `;
    // 
    //     modal.style.display = 'block';
    // 
    //     // 자동으로 5초 후 닫기
    //     setTimeout(() => {
    //         closeEmergencyModal();
    //     }, 10000);
    // }
}

// ===== 시스템 상태 업데이트 =====
function updateSystemStatus() {
    const connectedCount = patientData.length;
    const batteryWarningCount = patientData.filter(p => p.deviceBattery < 20).length;
    const criticalCount = patientData.filter(p => p.status === 'critical').length;

    document.getElementById('connected-count').textContent = connectedCount;
    document.getElementById('battery-warning-count').textContent = batteryWarningCount;
    document.getElementById('critical-count').textContent = criticalCount;
}

// ===== 알림 시스템 초기화 =====
function initializeNotifications() {
    notifications = [
        {
            type: 'info',
            title: '시스템 시작',
            message: 'MediWatch Pro 시스템이 정상적으로 시작되었습니다.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: false
        },
        {
            type: 'warning',
            title: '배터리 경고',
            message: '18명의 환자 기기에서 배터리 부족 경고가 발생했습니다.',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            read: false
        }
    ];

    updateNotificationBadge();
    renderNotifications();
}

// ===== 랜덤 알림 생성 =====
function generateRandomNotification() {
    const types = ['info', 'warning'];
    const messages = [
        '새로운 환자가 등록되었습니다.',
        '기기 배터리 점검이 완료되었습니다.',
        '야간 근무 교대 시간입니다.',
        '시스템 백업이 완료되었습니다.'
    ];

    const notification = {
        type: types[Math.floor(Math.random() * types.length)],
        title: '시스템 알림',
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(),
        read: false
    };

    addNotification(notification);
}

// ===== 알림 추가 =====
function addNotification(notification) {
    notifications.unshift(notification);
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    updateNotificationBadge();
    renderNotifications();
}

// ===== 알림 배지 업데이트 =====
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const unreadCount = notifications.filter(n => !n.read).length;

    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// ===== 알림 렌더링 =====
function renderNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    list.innerHTML = '';
    
    notifications.slice(0, 10).forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`;
        
        item.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${formatTime(notification.timestamp)}</div>
            </div>
            <button class="notification-close" onclick="removeNotification(${notification.id})">&times;</button>
        `;
        
        list.appendChild(item);
    });
}

// ===== 알림 토글 =====
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// ===== 모든 알림 읽음 처리 =====
function markAllRead() {
    notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    renderNotifications();
}

// ===== 알림 제거 =====
function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    updateNotificationBadge();
    renderNotifications();
}

// ===== 시간 포맷 =====
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
}

// ===== 프로필 메뉴 토글 =====
function toggleProfileMenu() {
    // 프로필 드롭다운 메뉴 구현
    console.log('프로필 메뉴 토글');
}

// ===== 사이드바 토글 =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// ===== 전체화면 토글 =====
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// ===== 데이터 내보내기 =====
function exportData() {
    const data = {
        patients: patientData,
        timestamp: new Date().toISOString(),
        exportType: 'patient_data'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== 보고서 출력 =====
function printReport() {
    window.print();
}

// ===== 환자 등록 =====
function addNewPatient() {
    alert('환자 등록 기능은 개발 중입니다.');
}

// ===== 기기 동기화 =====
function deviceSync() {
    alert('기기 동기화를 시작합니다...');
    // 실제 구현에서는 API 호출
}

// ===== 일일 보고서 생성 =====
function generateReport() {
    alert('일일 보고서를 생성합니다...');
    // 실제 구현에서는 보고서 생성 로직
}

// ===== 환자 상세보기 =====
function showPatientDetail(patientId) {
    const patient = patientData.find(p => p.id === patientId);
    if (patient) {
        // 환자 상세페이지로 이동
        const detailPage = `patient-detail.html?id=${patientId}`;
        console.log(`환자 상세페이지로 이동: ${detailPage}`);
        
        if (confirm(`${patient.name} 환자 상세정보 페이지로 이동하시겠습니까?`)) {
            // 실제 구현에서는 window.location.href = detailPage; 사용
            alert(`${patient.name} 환자 상세정보 페이지로 이동합니다.\n\n실제 구현에서는 ${detailPage} 페이지가 열립니다.`);
        }
    }
}

// ===== 알림 전송 =====
function sendAlert(patientId) {
    const patient = patientData.find(p => p.id === patientId);
    if (patient) {
        alert(`${patient.name} 환자에게 알림을 전송합니다.`);
    }
}

// ===== 메트릭 상세보기 =====
function showMetricDetail(metric) {
    // 상세페이지로 이동하는 기능
    const metricPages = {
        'oxygen': 'oxygen-detail.html',
        'heartrate': 'heartrate-detail.html',
        'temperature': 'temperature-detail.html',
        'sleep': 'sleep-detail.html'
    };
    
    const targetPage = metricPages[metric];
    if (targetPage) {
        // 새 페이지로 이동 (실제 구현에서는 라우팅 시스템 사용)
        console.log(`${metric} 상세페이지로 이동: ${targetPage}`);
        
        // 임시로 alert 대신 페이지 이동 시뮬레이션
        if (confirm(`${metric} 상세페이지로 이동하시겠습니까?`)) {
            // 실제 구현에서는 window.location.href = targetPage; 사용
            alert(`${metric} 상세페이지로 이동합니다.\n\n실제 구현에서는 ${targetPage} 페이지가 열립니다.`);
        }
    } else {
        alert(`${metric} 상세 정보를 표시합니다.`);
    }
}

// ===== 환자 데이터 새로고침 =====
function refreshPatientData() {
    showLoadingSpinner();
    setTimeout(() => {
        hideLoadingSpinner();
        alert('환자 데이터가 새로고침되었습니다.');
    }, 1000);
}

// ===== 페이지 변경 =====
function changePage(page) {
    if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        const maxPage = Math.ceil((filteredPatients.length || patientData.length) / patientsPerPage);
        currentPage = Math.min(maxPage, currentPage + 1);
    } else {
        currentPage = parseInt(page);
    }
    
    renderPatients();
    updatePagination(filteredPatients.length || patientData.length);
}

// ===== 페이지네이션 업데이트 =====
function updatePagination(totalPatients) {
    const totalPages = Math.ceil(totalPatients / patientsPerPage);
    const pagination = document.querySelector('.pagination');
    
    if (!pagination) return;
    
    const pageNumbers = pagination.querySelector('.page-numbers');
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                const pageNum = document.createElement('button');
                pageNum.className = `page-num ${i === currentPage ? 'active' : ''}`;
                pageNum.textContent = i;
                pageNum.onclick = () => changePage(i);
                pageNumbers.appendChild(pageNum);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.textContent = '...';
                pageNumbers.appendChild(dots);
            }
        }
    }
    
    // 이전/다음 버튼 상태 업데이트
    const prevBtn = pagination.querySelector('[data-page="prev"]');
    const nextBtn = pagination.querySelector('[data-page="next"]');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// ===== 뷰 모드 변경 =====
function changeViewMode(view) {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-view="${view}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 실제 뷰 변경 로직 구현
    console.log(`뷰 모드를 ${view}로 변경합니다.`);
}

// ===== 페이지 전환 =====
function switchPage(page) {
    console.log(`${page} 페이지로 전환합니다.`);
    // 실제 페이지 전환 로직 구현
}

// ===== 응급상황 모달 닫기 =====
function closeEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== 응급실 연락 =====
function callEmergency() {
    alert('응급실에 연락합니다. (119 또는 병원 내선)');
    closeEmergencyModal();
}

// ===== 의료진 호출 =====
function notifyStaff() {
    alert('의료진을 호출합니다.');
    closeEmergencyModal();
}