function calculateSupport() {
    const familyMembers = Number(document.getElementById('familyMembers').value);
    const familyIncome = Number(document.getElementById('familyIncome').value);
    const minIncome = Number(document.getElementById('minIncome').value);
    
    if (familyMembers === 0 || familyIncome === 0 || minIncome === 0) {
        document.getElementById('result').innerHTML = "يرجى إدخال جميع القيم بشكل صحيح.";
        document.getElementById('result').style.backgroundColor = "#ffcccc";
        return;
    }

    const individualIncome = familyIncome / familyMembers;
    
    let resultMessage;
    let resultColor;
    
    if (individualIncome <= minIncome) {
        resultMessage = "يستحق الدعم ✅";
        resultColor = "#ccffcc";
    } else {
        resultMessage = "لا يستحق الدعم ❌";
        resultColor = "#ffcccc";
    }

    document.getElementById('result').innerHTML = resultMessage;
    document.getElementById('result').style.backgroundColor = resultColor;
}

let currentYear = "firstYear"; // السنة الدراسية الافتراضية
let records = JSON.parse(localStorage.getItem(currentYear)) || [];

// تحديث العرض عند تغيير الفرقة الدراسية
function setYear(year) {
    currentYear = year;
    records = JSON.parse(localStorage.getItem(currentYear)) || [];
    updateDropdown();
    updateTable();
    document.getElementById('result').innerHTML = `تم التبديل إلى ${getYearName(year)}.`;
}

// تحويل اسم السنة إلى نصوص قابلة للعرض
function getYearName(year) {
    switch (year) {
        case "firstYear": return "الفرقة الأولى";
        case "secondYear": return "الفرقة الثانية";
        case "thirdYear": return "الفرقة الثالثة";
        case "fourthYear": return "الفرقة الرابعة";
        case "fifthYear": return "الفرقة الخامسة";
        default: return "";
    }
}

// تحديد الحاوية الرئيسية لتغيير الألوان
const container = document.querySelector('.container');
const table = document.getElementById('dataTable');

// الألوان المرتبطة بكل سنة دراسية
const yearClasses = ['year-1', 'year-2', 'year-3', 'year-4', 'year-5'];

// دالة لتبديل الألوان بناءً على السنة الدراسية المختارة
function switchYearColor(yearIndex) {
    // إزالة جميع الفئات السابقة
    yearClasses.forEach(yearClass => container.classList.remove(yearClass));

    // إضافة الفئة المناسبة للسنة الدراسية
    container.classList.add(yearClasses[yearIndex]);

    // تحديث الجدول بنفس اللون
    table.className = ''; // إزالة الفئات السابقة من الجدول
    table.classList.add(yearClasses[yearIndex]);
}

// إضافة مستمعين للأزرار الخاصة بكل سنة دراسية
document.querySelectorAll('.year-buttons button').forEach((button, index) => {
    button.addEventListener('click', () => switchYearColor(index));
});

// إضافة سجل جديد
function addRecord() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const nationalID = document.getElementById('nationalID').value;
    const land = Number(document.getElementById('land').value);
    const familyMembers = Number(document.getElementById('familyMembers').value);
    const familyIncome = Number(document.getElementById('familyIncome').value);
    const minIncome = Number(document.getElementById('minIncome').value);
    const individualIncome = familyIncome / familyMembers;
    const isEligible = individualIncome <= minIncome ? "يستحق الدعم" : "لا يستحق الدعم";

    // التحقق من وجود نفس الرقم القومي مسبقًا
    const duplicate = records.some(record => record.nationalID === nationalID);
    if (duplicate) {
        document.getElementById('result').innerHTML = `الرقم القومي ${nationalID} موجود مسبقًا!`;
        document.getElementById('result').style.backgroundColor = "#ffcccc";
        return;
    }

    const record = { name, phone, nationalID, land, familyMembers, familyIncome, individualIncome, minIncome, isEligible };
    records.push(record);
    saveData();
    updateDropdown();
    updateTable();
    document.getElementById('supportForm').reset();

    // تحديث الرسالة لإظهار ما إذا كان الشخص يستحق الدعم أم لا
    document.getElementById('result').innerHTML = `
        تم إضافة ${name} بنجاح إلى ${getYearName(currentYear)}! 
        <br> الحالة: ${isEligible}.
    `;
    document.getElementById('result').style.backgroundColor = isEligible === "يستحق الدعم" ? "#ccffcc" : "#ffcccc";
}

// حفظ البيانات في localStorage بناءً على السنة الدراسية
function saveData() {
    localStorage.setItem(currentYear, JSON.stringify(records));
}

// تحديث القائمة المنسدلة
        function updateDropdown() {
            const dropdown = document.getElementById('recordsDropdown');
            dropdown.innerHTML = '';
            records.forEach((record, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = record.name;
                dropdown.appendChild(option);
            });
        }

        function showRecord() {
            const index = document.getElementById('recordsDropdown').value;
            if (index !== '') {
                const record = records[index];
                alert(`الاسم: ${record.name}\nالتليفون: ${record.phone}\nالرقم القومي: ${record.nationalID}\nالحيازة الزراعية: ${record.land}\nعدد أفراد الأسرة: ${record.familyMembers}\nدخل الأسرة: ${record.familyIncome}\nنصيب الفرد: ${record.individualIncome.toFixed(2)}\nالحد الأدنى: ${record.minIncome}\nالاستحقاق: ${record.isEligible}`);
            }
        }

        function filterRecords() {
            const searchValue = document.getElementById('search').value.toLowerCase();
            const dropdown = document.getElementById('recordsDropdown');
            dropdown.innerHTML = '';
            records.forEach((record, index) => {
                if (record.name.toLowerCase().includes(searchValue)) {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = record.name;
                    dropdown.appendChild(option);
                }
            });
        }

// عرض البيانات في الجدول
function updateTable() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.phone}</td>
            <td>${record.nationalID}</td>
            <td>${record.land}</td>
            <td>${record.familyMembers}</td>
            <td>${record.familyIncome}</td>
            <td>${record.individualIncome.toFixed(2)}</td>
            <td>${record.minIncome}</td>
            <td>${record.isEligible}</td>
            <td><button onclick="editRecord(${index})">تعديل</button></td>
        `;
        tbody.appendChild(row);
    });
}

// تعديل سجل موجود
function editRecord(index) {
    const record = records[index];
    document.getElementById('name').value = record.name;
    document.getElementById('phone').value = record.phone;
    document.getElementById('nationalID').value = record.nationalID;
    document.getElementById('land').value = record.land;
    document.getElementById('familyMembers').value = record.familyMembers;
    document.getElementById('familyIncome').value = record.familyIncome;
    document.getElementById('minIncome').value = record.minIncome;
    records.splice(index, 1);
    saveData();
    updateDropdown();
    updateTable();
}

// تصدير البيانات إلى Excel
        function exportToExcel() {
    // إنشاء مصفوفة تحتوي على البيانات مع العناوين
    const data = [
        ["الاسم", "التليفون", "الرقم القومي", "الحيازة الزراعية", "عدد أفراد الأسرة", "دخل الأسرة", "نصيب الفرد", "الحد الأدنى", "الاستحقاق"],
        ...records.map(record => [
            record.name,
            record.phone,
            record.nationalID,
            record.land,
            record.familyMembers,
            record.familyIncome,
            record.individualIncome.toFixed(2),
            record.minIncome,
            record.isEligible
        ])
    ];

    // تحويل البيانات إلى ورقة عمل
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // إنشاء مصنف جديد
    const workbook = XLSX.utils.book_new();

    // إضافة الورقة إلى المصنف
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

    // كتابة المصنف إلى ملف بصيغة xlsx
    XLSX.writeFile(workbook, "records.xlsx");
}

// تصدير البيانات إلى JSON
function exportToJSON() {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'records.json';
    link.click();
}

// استيراد البيانات من JSON
function importFromJSON() {
    const fileInput = document.getElementById('importJSON');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        records = JSON.parse(e.target.result);
        saveData();
        updateDropdown();
        updateTable();
        alert('تم استيراد البيانات بنجاح!');
    };

    reader.readAsText(file);
}

// مسح كل البيانات
function clearAllData() {
    if (confirm('هل أنت متأكد من مسح كل البيانات؟')) {
        records = [];
        localStorage.removeItem(currentYear);
        updateDropdown();
        updateTable();
        alert('تم مسح كل البيانات بنجاح!');
    }
}

// إظهار/إخفاء القائمة المنسدلة
function toggleDropdown() {
    const dropdown = document.getElementById('recordsDropdown');
    const search = document.getElementById('search');
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        search.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
        search.style.display = 'none';
    }
}

// إظهار/إخفاء الجدول
function toggleTable() {
    const table = document.getElementById('dataTable');
    if (table.style.display === 'none') {
        table.style.display = 'table';
    } else {
        table.style.display = 'none';
    }
}