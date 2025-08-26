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

    // 설정 시스템 초기화
    initializeSettings();

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
        item.addEventListener('click', function (e) {
            const page = this.dataset.page;
            if (page === 'alerts') {
                e.preventDefault();
                openAlertsModal();
                return;
            }
            // 활성화 스타일 토글
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
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

    // 팝업 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        // 알림센터 팝업 외부 클릭 시 닫기
        const notificationBtn = document.querySelector('.notification-btn');
        const notificationDropdown = document.getElementById('notification-dropdown');
        if (notificationDropdown && notificationDropdown.style.display === 'block') {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.style.display = 'none';
            }
        }

        // 관리자 메뉴 팝업 외부 클릭 시 닫기
        const adminProfile = document.querySelector('.admin-profile');
        const adminMenu = document.getElementById('admin-menu');
        if (adminMenu && adminMenu.style.display === 'block') {
            if (!adminProfile.contains(e.target) && !adminMenu.contains(e.target)) {
                adminMenu.style.display = 'none';
            }
        }
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
            ${patient.assignedDevices && patient.assignedDevices.length > 0 ? `
                <div class="assigned-devices" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--info-color);">
                    <span class="device-label">📱 할당 기기:</span> 
                    ${patient.assignedDevices.map(deviceId => {
                        const device = connectedDevices.find(d => d.id === deviceId);
                        return device ? device.name : deviceId;
                    }).join(', ')}
                </div>
            ` : ''}
            ${patient.alerts.length > 0 ? `
                <div class="patient-alerts">
                    ${patient.alerts.map(alert => `<span class="alert-tag">${alert}</span>`).join('')}
                </div>
            ` : ''}
            ${patient.symptoms ? `
                <div class="patient-symptoms" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--gray-600);">
                    <span class="symptoms-label">증상:</span> ${patient.symptoms}
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

    // 사이드바 응급 알림 배지 업데이트
    const alertsBadge = document.querySelector('.menu-item[data-page="alerts"] .menu-badge');
    if (alertsBadge) {
        alertsBadge.textContent = String(emergencyAlerts.length);
        alertsBadge.classList.toggle('critical', emergencyAlerts.length > 0);
    }
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
function toggleNotifications(event) {
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.style.display = 'block';
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
    // 사용 안 함: openAdminMenu로 대체
    openAdminMenu();
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
    openPatientModal();
}

// ===== 기기 동기화 =====
function deviceSync() {
    openDeviceSyncModal();
    // 실제 동기화 프로세스 시작
    setTimeout(() => {
        syncDevices();
        showNotification('모든 기기 동기화가 완료되었습니다.', 'success');
    }, 2000);
}


// ===== 환자 상세보기 =====
function showPatientDetail(patientId) {
    const patient = patientData.find(p => p.id === patientId);
    if (patient) {
        // 상세 페이지로 바로 이동 (html 폴더 내 개별 페이지)
        const detailPage = `individual_home.html?id=${patientId}`;
        window.location.href = detailPage;
    }
}

// ===== 알림 전송 =====
function sendAlert(patientId) {
    const patient = patientData.find(p => p.id === patientId);
    if (patient) {
        alert(`${patient.name} 환자에게 알림을 전송합니다.`);
    }
}

// 메트릭 상세보기 기능 제거 (요청사항)

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
    
    const patientList = document.getElementById('patient-list');
    if (!patientList) return;
    patientList.classList.remove('view-grid');
    if (view === 'grid') patientList.classList.add('view-grid');
}

// ===== 페이지 전환 =====
function switchPage(page) {
    const allPages = document.querySelectorAll('.page-view');
    allPages.forEach(p => p.style.display = 'none');
    const map = {
        dashboard: 'page-dashboard',
        alerts: null, // 모달로 처리
        analytics: 'page-analytics',
        trends: 'page-trends',
        patients: 'page-patients',
        devices: 'page-devices',
        settings: 'page-settings',
    };
    const targetId = map[page] || 'page-dashboard';
    if (targetId) {
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'block';
    }
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

// ===== 응급 알림 모달 =====
function openAlertsModal() {
    const modal = document.getElementById('alerts-modal');
    if (!modal) return;
    renderAlertsList();
    modal.style.display = 'flex';
}

function closeAlertsModal() {
    const modal = document.getElementById('alerts-modal');
    if (!modal) return;
    modal.style.display = 'none';
}

function renderAlertsList() {
    const container = document.getElementById('alerts-list');
    if (!container) return;
    container.innerHTML = '';
    if (emergencyAlerts.length === 0) {
        container.innerHTML = '<p>현재 응급 알림이 없습니다.</p>';
        return;
    }
    emergencyAlerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.innerHTML = `
            <div class="title">${alert.message}</div>
            <div class="meta">${alert.timestamp.toLocaleString('ko-KR')} | ${alert.patientName} (${alert.room})</div>
            <div class="vitals">심박수: <strong>${alert.vitals.heartRate} BPM</strong> · 산소: <strong>${alert.vitals.oxygen}%</strong> · 체온: <strong>${alert.vitals.temperature}°C</strong> · 혈압: <strong>${alert.vitals.bloodPressure}</strong></div>
        `;
        container.appendChild(div);
    });
}

// ===== 관리자 전환 메뉴 =====
function openAdminMenu(event) {
    const menu = document.getElementById('admin-menu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 8}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.display = 'block';

    if (!menu.dataset.bound) {
        menu.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (!li) return;
            const name = li.dataset.name;
            const role = li.dataset.role;
            const nameEl = document.querySelector('.admin-name');
            const roleEl = document.querySelector('.admin-role');
            if (nameEl) nameEl.textContent = name;
            if (roleEl) roleEl.textContent = role;
            menu.style.display = 'none';
        });
        menu.dataset.bound = 'true';
    }
}

// ===== 액션 모달들 =====
function openPatientModal() {
    const modal = buildSimpleModal('환자 등록', `
        <form id="patient-form" class="form-grid">
            <label>이름<input name="name" placeholder="환자 이름을 입력하세요" required></label>
            <label>병실<input name="room" placeholder="예: 301호" required></label>
            <label>병동<select name="ward"><option value="icu">중환자실</option><option value="general">일반병동</option><option value="recovery">회복실</option></select></label>
            <label>나이<input type="number" name="age" min="1" max="120" placeholder="나이" required></label>
            <label>성별<select name="gender"><option value="M">남성</option><option value="F">여성</option></select></label>
            <label>연락처<input type="tel" name="phone" placeholder="010-0000-0000"></label>
            <label>보호자 연락처<input type="tel" name="guardianPhone" placeholder="010-0000-0000"></label>
            <label>주요 증상<textarea name="symptoms" placeholder="주요 증상을 간단히 입력하세요" rows="3"></textarea></label>
            <label>할당 기기<select name="assignedDevice">
                <option value="">기기 없음</option>
                ${connectedDevices.map(device => `<option value="${device.id}">${device.name} (🔋 ${device.battery}%)</option>`).join('')}
            </select></label>
        </form>
    `, [
        { text: '취소', action: (m)=> m.remove() },
        { text: '등록', primary: true, action: () => {
            const form = document.getElementById('patient-form');
            const data = Object.fromEntries(new FormData(form).entries());
            
            // 필수 필드 검증
            if (!data.name || !data.room || !data.age) {
                showNotification('필수 정보를 모두 입력해주세요.', 'error');
                return;
            }
            
            const newPatient = {
                id: `P${String(patientData.length + 1).padStart(3,'0')}`,
                name: data.name,
                room: data.room,
                ward: data.ward,
                age: parseInt(data.age,10),
                gender: data.gender,
                phone: data.phone || '',
                guardianPhone: data.guardianPhone || '',
                symptoms: data.symptoms || '',
                status: 'normal',
                vitals: generateRandomVitals('normal'),
                lastUpdate: new Date(),
                deviceBattery: data.assignedDevice ? 100 : 0,
                alerts: [],
                admissionDate: new Date(),
                assignedDevices: data.assignedDevice ? [data.assignedDevice] : []
            };
            
            patientData.unshift(newPatient);
            filteredPatients = [];
            currentPage = 1;
            renderPatients();
            updateHealthCards();
            modal.remove();
            
            showNotification(`${data.name} 환자가 성공적으로 등록되었습니다.`, 'success');
        }}
    ]);
    document.body.appendChild(modal);
}

function openDeviceSyncModal() {
    const modal = buildSimpleModal('기기 동기화', `
        <div style="margin-bottom: 1rem;">
            <p>연결된 기기들의 상태를 동기화합니다.</p>
            <div style="font-size: 0.9rem; color: var(--gray-600); margin-bottom: 1rem;">
                총 ${connectedDevices.length}개 기기 연결됨
            </div>
        </div>
        
        <div id="sync-progress-container">
            <div id="sync-bar" style="height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden;margin-bottom:0.5rem;">
                <div id="sync-progress" style="height:100%;width:0;background:var(--primary-color);transition:width 0.3s ease;"></div>
            </div>
            <div id="sync-status" style="font-size:0.9rem;color:var(--gray-600);text-align:center;">동기화 준비 중...</div>
        </div>
        
        <div id="device-sync-list" style="margin-top:1rem;max-height:200px;overflow-y:auto;">
            ${connectedDevices.map(device => `
                <div class="device-sync-item" data-device-id="${device.id}" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem;border:1px solid var(--gray-200);border-radius:4px;margin-bottom:0.5rem;">
                    <span class="device-icon">⌚</span>
                    <span class="device-name" style="flex:1;">${device.name}</span>
                    <span class="sync-status" style="font-size:0.8rem;color:var(--gray-500);">대기 중</span>
                </div>
            `).join('')}
        </div>
    `, [{ text: '닫기', action: (m)=> m.remove() }]);
    
    document.body.appendChild(modal);
    
    // 동기화 진행률 시뮬레이션
    let progress = 0;
    const bar = modal.querySelector('#sync-progress');
    const status = modal.querySelector('#sync-status');
    const deviceItems = modal.querySelectorAll('.device-sync-item');
    
    const timer = setInterval(() => {
        progress += Math.random() * 15;
        const currentProgress = Math.min(100, progress);
        bar.style.width = currentProgress + '%';
        
        if (currentProgress < 30) {
            status.textContent = '기기 연결 확인 중...';
        } else if (currentProgress < 60) {
            status.textContent = '데이터 동기화 중...';
        } else if (currentProgress < 90) {
            status.textContent = '상태 업데이트 중...';
        } else {
            status.textContent = '동기화 완료!';
        }
        
        // 각 기기별 동기화 상태 업데이트
        deviceItems.forEach((item, index) => {
            const deviceId = item.dataset.deviceId;
            const syncStatus = item.querySelector('.sync-status');
            const device = connectedDevices.find(d => d.id === deviceId);
            
            if (currentProgress > (index + 1) * 20) {
                syncStatus.textContent = '완료';
                syncStatus.style.color = 'var(--success-color)';
                if (device) {
                    device.lastSync = new Date();
                    device.battery = Math.max(0, device.battery - Math.floor(Math.random() * 2));
                }
            } else if (currentProgress > index * 20) {
                syncStatus.textContent = '동기화 중...';
                syncStatus.style.color = 'var(--primary-color)';
            }
        });
        
        if (progress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                showNotification('모든 기기 동기화가 완료되었습니다.', 'success');
            }, 500);
        }
    }, 300);
}

function openDailyReportModal() {
    const modal = buildSimpleModal('일일 보고서', `
        <p>오늘의 데이터를 기반으로 보고서를 생성합니다.</p>
        <button id="btn-export" class="action-btn primary" style="margin-top:0.5rem;">JSON 내보내기</button>
    `, [{ text: '닫기', action: (m)=> m.remove() }]);
    document.body.appendChild(modal);
    modal.querySelector('#btn-export').addEventListener('click', exportData);
}

function buildSimpleModal(title, bodyHtml, actions) {
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.style.display = 'flex';
    wrap.innerHTML = `
        <div class="modal-content" style="width:min(520px,90vw)">
            <div class="modal-header"><h2>${title}</h2><button class="modal-close">&times;</button></div>
            <div class="modal-body">${bodyHtml}</div>
            <div class="modal-footer" style="display:flex;gap:0.5rem;justify-content:flex-end;padding:0 1.25rem 1rem;">
                ${actions.map((a,i)=>`<button data-idx="${i}" class="${a.primary?'detail-btn':''}">${a.text}</button>`).join('')}
            </div>
        </div>
    `;
    wrap.querySelector('.modal-close').onclick = () => wrap.remove();
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) wrap.remove(); });
    actions.forEach((a,i)=>{
        wrap.querySelector(`[data-idx="${i}"]`).onclick = ()=> a.action(wrap);
    });
    return wrap;
}

// ===== 설정 시스템 =====
let systemSettings = {
    // 웨어러블 기기 설정
    autoSync: true,
    syncInterval: 60,
    dataBackup: false,
    
    // 알림 임계치
    thresholds: {
        heartRate: { min: 60, max: 100 },
        oxygen: { min: 95, max: 100 },
        temperature: { min: 36.0, max: 37.5 }
    },
    
    // 알림 채널
    notifications: {
        email: false,
        sms: false,
        push: true
    },
    
    // 시스템 설정
    dataRetention: 90,
    autoBackup: true,
    twoFactorAuth: false,
    sessionTimeout: 30
};

let connectedDevices = [
    {
        id: 'DEV001',
        name: 'Apple Watch Series 8',
        type: 'smartwatch',
        status: 'connected',
        battery: 85,
        lastSync: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
        id: 'DEV002',
        name: 'Samsung Galaxy Watch 6',
        type: 'smartwatch',
        status: 'connected',
        battery: 72,
        lastSync: new Date(Date.now() - 1000 * 60 * 2)
    }
];

// 설정 초기화
function initializeSettings() {
    loadSettings();
    renderDeviceList();
    updateSettingsUI();
}

// 설정 로드
function loadSettings() {
    const saved = localStorage.getItem('mediwatch-settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            systemSettings = { ...systemSettings, ...parsed };
        } catch (e) {
            console.error('설정 로드 실패:', e);
        }
    }
}

// 설정 저장
function saveSettings() {
    try {
        // UI에서 현재 값들을 가져와서 설정 객체 업데이트
        updateSettingsFromUI();
        
        // 로컬 스토리지에 저장
        localStorage.setItem('mediwatch-settings', JSON.stringify(systemSettings));
        
        // 성공 메시지 표시
        showNotification('설정이 저장되었습니다.', 'success');
        
        // 설정 적용
        applySettings();
    } catch (e) {
        console.error('설정 저장 실패:', e);
        showNotification('설정 저장에 실패했습니다.', 'error');
    }
}

// UI에서 설정 값 가져오기
function updateSettingsFromUI() {
    // 웨어러블 기기 설정
    systemSettings.autoSync = document.getElementById('auto-sync').checked;
    systemSettings.syncInterval = parseInt(document.getElementById('sync-interval').value);
    systemSettings.dataBackup = document.getElementById('data-backup').checked;
    
    // 알림 임계치
    systemSettings.thresholds.heartRate.min = parseInt(document.getElementById('hr-min').value) || 60;
    systemSettings.thresholds.heartRate.max = parseInt(document.getElementById('hr-max').value) || 100;
    systemSettings.thresholds.oxygen.min = parseInt(document.getElementById('o2-min').value) || 95;
    systemSettings.thresholds.oxygen.max = parseInt(document.getElementById('o2-max').value) || 100;
    systemSettings.thresholds.temperature.min = parseFloat(document.getElementById('temp-min').value) || 36.0;
    systemSettings.thresholds.temperature.max = parseFloat(document.getElementById('temp-max').value) || 37.5;
    
    // 알림 채널
    systemSettings.notifications.email = document.getElementById('email-notifications').checked;
    systemSettings.notifications.sms = document.getElementById('sms-notifications').checked;
    systemSettings.notifications.push = document.getElementById('push-notifications').checked;
    
    // 시스템 설정
    systemSettings.dataRetention = parseInt(document.getElementById('data-retention').value);
    systemSettings.autoBackup = document.getElementById('auto-backup').checked;
    systemSettings.twoFactorAuth = document.getElementById('two-factor-auth').checked;
    systemSettings.sessionTimeout = parseInt(document.getElementById('session-timeout').value);
}

// 설정 UI 업데이트
function updateSettingsUI() {
    // 웨어러블 기기 설정
    document.getElementById('auto-sync').checked = systemSettings.autoSync;
    document.getElementById('sync-interval').value = systemSettings.syncInterval;
    document.getElementById('data-backup').checked = systemSettings.dataBackup;
    
    // 알림 임계치
    document.getElementById('hr-min').value = systemSettings.thresholds.heartRate.min;
    document.getElementById('hr-max').value = systemSettings.thresholds.heartRate.max;
    document.getElementById('o2-min').value = systemSettings.thresholds.oxygen.min;
    document.getElementById('o2-max').value = systemSettings.thresholds.oxygen.max;
    document.getElementById('temp-min').value = systemSettings.thresholds.temperature.min;
    document.getElementById('temp-max').value = systemSettings.thresholds.temperature.max;
    
    // 알림 채널
    document.getElementById('email-notifications').checked = systemSettings.notifications.email;
    document.getElementById('sms-notifications').checked = systemSettings.notifications.sms;
    document.getElementById('push-notifications').checked = systemSettings.notifications.push;
    
    // 시스템 설정
    document.getElementById('data-retention').value = systemSettings.dataRetention;
    document.getElementById('auto-backup').checked = systemSettings.autoBackup;
    document.getElementById('two-factor-auth').checked = systemSettings.twoFactorAuth;
    document.getElementById('session-timeout').value = systemSettings.sessionTimeout;
}

// 설정 적용
function applySettings() {
    // 동기화 주기 적용
    if (systemSettings.autoSync) {
        startAutoSync(systemSettings.syncInterval);
    } else {
        stopAutoSync();
    }
    
    // 임계치 적용
    updateAlertThresholds();
    
    console.log('설정이 적용되었습니다:', systemSettings);
}

// 자동 동기화 시작
function startAutoSync(interval) {
    if (window.syncInterval) {
        clearInterval(window.syncInterval);
    }
    
    window.syncInterval = setInterval(() => {
        syncDevices();
    }, interval * 1000);
}

// 자동 동기화 중지
function stopAutoSync() {
    if (window.syncInterval) {
        clearInterval(window.syncInterval);
        window.syncInterval = null;
    }
}

// 기기 동기화
function syncDevices() {
    console.log('기기 동기화 중...');
    // 실제 구현에서는 API 호출
    connectedDevices.forEach(device => {
        device.lastSync = new Date();
        device.battery = Math.max(0, device.battery - Math.floor(Math.random() * 3));
        
        // 해당 기기가 할당된 환자들의 배터리 정보 업데이트
        patientData.forEach(patient => {
            if (patient.assignedDevices && patient.assignedDevices.includes(device.id)) {
                patient.deviceBattery = device.battery;
                patient.lastUpdate = new Date();
            }
        });
    });
    renderDeviceList();
    renderPatients(); // 환자 목록도 업데이트
}

// 기기 목록 렌더링
function renderDeviceList() {
    const deviceList = document.getElementById('device-list');
    if (!deviceList) return;
    
    if (connectedDevices.length === 0) {
        deviceList.innerHTML = '<p style="color: var(--gray-500); text-align: center;">연결된 기기가 없습니다.</p>';
        return;
    }
    
    deviceList.innerHTML = connectedDevices.map(device => `
        <div class="device-item">
            <div class="device-icon">⌚</div>
            <div class="device-info">
                <div class="device-name">${device.name}</div>
                <div class="device-status">
                    ${device.status === 'connected' ? '🟢 연결됨' : '🔴 연결 안됨'} | 
                    🔋 ${device.battery}% | 
                    마지막 동기화: ${formatTime(device.lastSync)}
                </div>
            </div>
            <div class="device-actions">
                <button class="device-btn" onclick="syncDevice('${device.id}')">동기화</button>
                <button class="device-btn danger" onclick="removeDevice('${device.id}')">제거</button>
            </div>
        </div>
    `).join('');
}

// 새 기기 추가
function addNewDevice() {
    const modal = buildSimpleModal('새 기기 추가', `
        <form id="device-form" class="form-grid">
            <label>기기 이름<input name="name" placeholder="예: Apple Watch Series 8" required></label>
            <label>기기 유형<select name="type"><option value="smartwatch">스마트워치</option><option value="fitness">피트니스 밴드</option><option value="medical">의료 기기</option></select></label>
            <label>연결 방식<select name="connection"><option value="bluetooth">Bluetooth</option><option value="wifi">Wi-Fi</option><option value="cellular">셀룰러</option></select></label>
        </form>
    `, [
        { text: '취소', action: (m) => m.remove() },
        { text: '추가', primary: true, action: () => {
            const form = document.getElementById('device-form');
            const data = Object.fromEntries(new FormData(form).entries());
            
            const newDevice = {
                id: 'DEV' + String(connectedDevices.length + 1).padStart(3, '0'),
                name: data.name,
                type: data.type,
                status: 'connected',
                battery: 100,
                lastSync: new Date()
            };
            
            connectedDevices.push(newDevice);
            renderDeviceList();
            modal.remove();
            showNotification('새 기기가 추가되었습니다.', 'success');
        }}
    ]);
    document.body.appendChild(modal);
}

// 기기 동기화
function syncDevice(deviceId) {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (device) {
        device.lastSync = new Date();
        device.battery = Math.max(0, device.battery - Math.floor(Math.random() * 2));
        renderDeviceList();
        showNotification(`${device.name} 동기화 완료`, 'success');
    }
}

// 기기 제거
function removeDevice(deviceId) {
    if (confirm('정말로 이 기기를 제거하시겠습니까?')) {
        connectedDevices = connectedDevices.filter(d => d.id !== deviceId);
        renderDeviceList();
        showNotification('기기가 제거되었습니다.', 'success');
    }
}

// 설정 기본값 복원
function resetSettings() {
    if (confirm('모든 설정을 기본값으로 복원하시겠습니까?')) {
        systemSettings = {
            autoSync: true,
            syncInterval: 60,
            dataBackup: false,
            thresholds: {
                heartRate: { min: 60, max: 100 },
                oxygen: { min: 95, max: 100 },
                temperature: { min: 36.0, max: 37.5 }
            },
            notifications: {
                email: false,
                sms: false,
                push: true
            },
            dataRetention: 90,
            autoBackup: true,
            twoFactorAuth: false,
            sessionTimeout: 30
        };
        
        updateSettingsUI();
        showNotification('설정이 기본값으로 복원되었습니다.', 'success');
    }
}

// 알림 임계치 업데이트
function updateAlertThresholds() {
    // 실제 구현에서는 알림 시스템에 임계치 적용
    console.log('알림 임계치 업데이트:', systemSettings.thresholds);
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 간단한 토스트 알림 구현
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}