// ===================== المتغيرات العامة =====================
let currentYear = "firstYear";
let students = [];
let editIndex = -1;
let tableVisible = true;
let dropdownVisible = true;

// ===================== دوال مساعدة =====================
function getYearName(year) {
    const names = {
        firstYear: "الفرقة الأولى",
        secondYear: "الفرقة الثانية",
        thirdYear: "الفرقة الثالثة",
        fourthYear: "الفرقة الرابعة",
        fifthYear: "الفرقة الخامسة"
    };
    return names[year] || year;
}

function loadFromStorage() {
    const stored = localStorage.getItem(currentYear);
    students = stored ? JSON.parse(stored) : [];
    renderAll();
}

function saveToStorage() {
    localStorage.setItem(currentYear, JSON.stringify(students));
}

function calculateEligibility(student) {
    const perCapita = student.familyIncome / student.familyMembers;
    const eligible = (perCapita <= student.minIncome) && (student.land <= 0);
    return { perCapita: perCapita.toFixed(2), eligible };
}

function showMessage(msg, isError = false) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div style="background:${isError ? '#f8d7da' : '#d4edda'}; color:${isError ? '#721c24' : '#155724'}; padding:10px; border-radius:5px;">${msg}</div>`;
    setTimeout(() => {
        if (resultDiv.innerHTML.includes(msg)) resultDiv.innerHTML = '';
    }, 3000);
}

// ===================== عرض البيانات =====================
function renderAll() {
    renderTable();
    updateStats();
    updateDropdown();
    saveToStorage();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    const searchTerm = document.getElementById('search').value.toLowerCase();
    let filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.phone.includes(searchTerm) ||
        s.nationalID.includes(searchTerm)
    );

    filtered.forEach((s, idx) => {
        const { perCapita, eligible } = calculateEligibility(s);
        const originalIndex = students.findIndex(orig => orig.nationalID === s.nationalID && orig.phone === s.phone);
        const row = tbody.insertRow();
        row.className = eligible ? 'eligible-row' : 'not-eligible-row';
        row.insertCell(0).innerText = s.name;
        row.insertCell(1).innerText = s.phone;
        row.insertCell(2).innerText = s.nationalID;
        row.insertCell(3).innerText = s.land;
        row.insertCell(4).innerText = s.familyMembers;
        row.insertCell(5).innerText = s.familyIncome;
        row.insertCell(6).innerText = perCapita;
        row.insertCell(7).innerText = s.minIncome;
        row.insertCell(8).innerText = eligible ? "✅ مستحق" : "❌ غير مستحق";
        const actionsCell = row.insertCell(9);
        actionsCell.className = "action-buttons";
        const editBtn = document.createElement('button');
        editBtn.innerText = '✏️ تعديل';
        editBtn.style.background = '#f59e0b';
        editBtn.onclick = () => editStudent(originalIndex);
        const delBtn = document.createElement('button');
        delBtn.innerText = '🗑️ حذف';
        delBtn.style.background = '#dc2626';
        delBtn.onclick = () => deleteStudent(originalIndex);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(delBtn);
    });
    document.getElementById('tableWrapper').style.display = tableVisible ? 'block' : 'none';
}

function updateStats() {
    const total = students.length;
    let eligibleCount = 0;
    for (let s of students) {
        if (calculateEligibility(s).eligible) eligibleCount++;
    }
    const notEligible = total - eligibleCount;
    const percent = total === 0 ? 0 : ((eligibleCount / total) * 100).toFixed(1);
    document.getElementById('totalCount').innerText = total;
    document.getElementById('eligibleCount').innerText = eligibleCount;
    document.getElementById('notEligibleCount').innerText = notEligible;
    document.getElementById('eligibilityPercent').innerText = percent;
}

function updateDropdown() {
    const dropdown = document.getElementById('recordsDropdown');
    dropdown.innerHTML = '';
    const searchTerm = document.getElementById('search').value.toLowerCase();
    let filtered = students.filter(s => s.name.toLowerCase().includes(searchTerm) || s.phone.includes(searchTerm));
    filtered.forEach((s, idx) => {
        const { eligible } = calculateEligibility(s);
        const option = document.createElement('option');
        option.text = `${s.name} - ${eligible ? "مستحق ✅" : "غير مستحق ❌"} - ${s.phone}`;
        option.value = students.findIndex(orig => orig.nationalID === s.nationalID);
        dropdown.appendChild(option);
    });
    dropdown.style.display = dropdownVisible ? 'block' : 'none';
    if (filtered.length === 0) dropdown.innerHTML = '<option>لا توجد بيانات</option>';
}

// ===================== عمليات CRUD =====================
function addOrUpdate() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const nationalID = document.getElementById('nationalID').value.trim();
    const land = parseFloat(document.getElementById('land').value) || 0;
    const familyMembers = parseInt(document.getElementById('familyMembers').value);
    const familyIncome = parseFloat(document.getElementById('familyIncome').value) || 0;
    const minIncome = parseFloat(document.getElementById('minIncome').value) || 0;

    if (!name || !phone || !nationalID || familyMembers < 1) {
        showMessage("يرجى تعبئة الاسم، التليفون، الرقم القومي وعدد الأفراد", true);
        return;
    }
    if (!/^\d{11}$/.test(phone)) {
        showMessage("رقم التليفون يجب أن يكون 11 رقمًا", true);
        return;
    }
    if (!/^\d{14}$/.test(nationalID)) {
        showMessage("الرقم القومي يجب أن يكون 14 رقمًا", true);
        return;
    }

    const newStudent = { name, phone, nationalID, land, familyMembers, familyIncome, minIncome };

    if (editIndex === -1) {
        if (students.some(s => s.nationalID === nationalID)) {
            showMessage("هذا الرقم القومي مسجل مسبقًا!", true);
            return;
        }
        students.push(newStudent);
        showMessage(`✅ تم إضافة ${name} بنجاح`);
    } else {
        students[editIndex] = newStudent;
        showMessage(`✏️ تم تعديل بيانات ${name}`);
        editIndex = -1;
        document.getElementById('addBtn').textContent = "➕ إضافة / تحديث";
    }
    clearForm();
    renderAll();
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('nationalID').value = '';
    document.getElementById('land').value = '0';
    document.getElementById('familyMembers').value = '1';
    document.getElementById('familyIncome').value = '';
    document.getElementById('minIncome').value = '500';
    editIndex = -1;
    document.getElementById('addBtn').textContent = "➕ إضافة / تحديث";
}

function editStudent(index) {
    const s = students[index];
    document.getElementById('name').value = s.name;
    document.getElementById('phone').value = s.phone;
    document.getElementById('nationalID').value = s.nationalID;
    document.getElementById('land').value = s.land;
    document.getElementById('familyMembers').value = s.familyMembers;
    document.getElementById('familyIncome').value = s.familyIncome;
    document.getElementById('minIncome').value = s.minIncome;
    editIndex = index;
    document.getElementById('addBtn').textContent = "🔄 تحديث البيانات";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteStudent(index) {
    if (confirm(`هل تريد حذف الطالب "${students[index].name}"؟`)) {
        students.splice(index, 1);
        renderAll();
        showMessage("🗑️ تم الحذف بنجاح");
        if (editIndex === index) editIndex = -1;
    }
}

// ===================== تبديل السنة =====================
function setYear(year) {
    currentYear = year;
    loadFromStorage();
    const container = document.getElementById('mainContainer');
    container.classList.remove('year-1', 'year-2', 'year-3', 'year-4', 'year-5');
    const yearMap = {
        firstYear: 'year-1',
        secondYear: 'year-2',
        thirdYear: 'year-3',
        fourthYear: 'year-4',
        fifthYear: 'year-5'
    };
    container.classList.add(yearMap[year]);
    document.querySelectorAll('.year-buttons button').forEach(btn => {
        if (btn.getAttribute('data-year') === year) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    showMessage(`تم التبديل إلى ${getYearName(year)}`, false);
}

// ===================== البحث والفلترة =====================
function filterTable() {
    renderTable();
    updateDropdown();
}

function showSelectedRecord() {
    const dropdown = document.getElementById('recordsDropdown');
    const selectedValue = dropdown.value;
    if (selectedValue !== "" && students[selectedValue]) {
        editStudent(parseInt(selectedValue));
    }
}

// ===================== إظهار/إخفاء العناصر =====================
function toggleDropdown() {
    dropdownVisible = !dropdownVisible;
    document.getElementById('recordsDropdown').style.display = dropdownVisible ? 'block' : 'none';
}

function toggleTable() {
    tableVisible = !tableVisible;
    document.getElementById('tableWrapper').style.display = tableVisible ? 'block' : 'none';
}

// ===================== التصدير والاستيراد =====================
function exportToExcel() {
    const dataForExcel = students.map(s => {
        const { perCapita, eligible } = calculateEligibility(s);
        return {
            "الاسم": s.name,
            "التليفون": s.phone,
            "الرقم القومي": s.nationalID,
            "الحيازة (فدان)": s.land,
            "عدد الأسرة": s.familyMembers,
            "دخل الأسرة": s.familyIncome,
            "نصيب الفرد": perCapita,
            "الحد الأدنى": s.minIncome,
            "الاستحقاق": eligible ? "مستحق" : "غير مستحق"
        };
    });
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, getYearName(currentYear));
    XLSX.writeFile(wb, `طلاب_${getYearName(currentYear)}_${new Date().toISOString().slice(0, 19)}.xlsx`);
}

function exportToPDF() {
    const element = document.getElementById('dataTable');
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `تقرير_${getYearName(currentYear)}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

function printTable() {
    const printWindow = window.open('', '_blank');
    const tableHtml = document.getElementById('dataTable').outerHTML;
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تقرير الطلاب - ${getYearName(currentYear)}</title>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
            </style>
        </head>
        <body>${tableHtml}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function exportToJSON() {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${currentYear}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                students = imported;
                renderAll();
                showMessage("تم استيراد البيانات بنجاح");
            } else {
                throw new Error();
            }
        } catch (err) {
            showMessage("الملف غير صالح", true);
        }
    };
    reader.readAsText(file);
    document.getElementById('importJSON').value = '';
}

function clearAllData() {
    if (confirm(`⚠️ تحذير: سيتم مسح جميع بيانات ${getYearName(currentYear)} نهائياً. هل أنت متأكد؟`)) {
        students = [];
        renderAll();
        showMessage("تم مسح جميع البيانات");
    }
}

// ===================== ربط الأحداث عند تحميل الصفحة =====================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addBtn').onclick = addOrUpdate;
    document.getElementById('cancelEditBtn').onclick = () => {
        clearForm();
        showMessage("تم إلغاء التعديل");
    };
    document.getElementById('importJSON').onchange = importFromJSON;

    document.querySelectorAll('.year-buttons button').forEach(btn => {
        btn.addEventListener('click', () => setYear(btn.getAttribute('data-year')));
    });

    // تعيين السنة الافتراضية
    setYear('firstYear');
});

// جعل الدوال العامة متاحة للاستدعاء من HTML (onclick)
window.filterTable = filterTable;
window.toggleDropdown = toggleDropdown;
window.toggleTable = toggleTable;
window.showSelectedRecord = showSelectedRecord;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.printTable = printTable;
window.exportToJSON = exportToJSON;
window.clearAllData = clearAllData;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
