"use strict";

// ============================================================
// API ENDPOINT
// ============================================================
const API_URL = "../../api/femaleForms/";
// Replace with your actual endpoint, e.g.:
// "https://your-backend.com/api/femaleForms/addFemaleForm"

// ============================================================
// ELEMENT REFS
// ============================================================
const form              = document.getElementById("femaleForm");
const steps             = document.querySelectorAll(".form-step");
const nextBtn           = document.getElementById("nextBtn");
const prevBtn           = document.getElementById("prevBtn");
const submitBtn         = document.getElementById("submitBtn");
const clearDraftBtn     = document.getElementById("clearDraftBtn");
const progressBar       = document.getElementById("progress");
const stepTitleEl       = document.getElementById("stepTitle");
const currentStepEl     = document.getElementById("currentStep");
const totalStepsEl      = document.getElementById("totalSteps");
const stepDotsContainer = document.getElementById("stepDots");
const messageEl         = document.getElementById("message");

const STORAGE_KEY       = "female_form_draft";
const TOTAL_STEPS       = steps.length;

let currentStep = 1;

const stepTitles = [
    "البيانات الأساسية",
    "الحجاب",
    "التعليم والعمل",
    "السكن والإقامة",
    "معلومات الأسرة",
    "الحالة الاجتماعية والزواج",
    "الدين والصحة",
    "مواصفات الزوج المطلوب",
    "معلومات التواصل"
];

// ============================================================
// HELPERS
// ============================================================
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}
function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null) return;
    el.value = value;
}
function getBooleanValue(id) {
    const v = getValue(id);
    if (v === "") return null;
    return v === "true";
}
function setBooleanValue(id, value) {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null) return;
    el.value = String(value);
}
function getNumberValue(id) {
    const v = getValue(id);
    if (v === "") return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
}

// ============================================================
// MULTI-VALUE HELPERS
// ============================================================
function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(cb => cb.value);
}
function setCheckedValues(name, values) {
    if (!Array.isArray(values)) return;
    document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
        cb.checked = values.includes(cb.value);
    });
}
function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
}
function setRadioValue(name, value) {
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
}

// ============================================================
// STEP DOTS
// ============================================================
function buildStepDots() {
    totalStepsEl.textContent = TOTAL_STEPS;
    stepDotsContainer.innerHTML = "";
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const dot = document.createElement("div");
        dot.className = "step-dot";
        dot.id = `dot-${i}`;
        dot.textContent = i;
        stepDotsContainer.appendChild(dot);
    }
}
function updateDots(active) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (!dot) continue;
        dot.className = "step-dot";
        if (i < active)   dot.classList.add("done");
        if (i === active) dot.classList.add("active");
    }
}

// ============================================================
// SHOW STEP
// ============================================================
function showStep(step) {
    steps.forEach(s => s.classList.remove("active"));
    const sec = document.querySelector(`.form-step[data-step="${step}"]`);
    if (sec) sec.classList.add("active");

    currentStepEl.textContent = step;
    stepTitleEl.textContent = stepTitles[step - 1] || "";

    progressBar.style.width = `${(step / TOTAL_STEPS) * 100}%`;
    prevBtn.classList.toggle("hidden", step === 1);
    nextBtn.classList.toggle("hidden", step === TOTAL_STEPS);
    submitBtn.classList.toggle("hidden", step !== TOTAL_STEPS);
    updateDots(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
// AGE OPTIONS (18-80 for groom)
// ============================================================
function populateAgeOptions() {
    const min = document.getElementById("grMinAge");
    const max = document.getElementById("grMaxAge");
    for (let age = 18; age <= 80; age++) {
        const o1 = document.createElement("option"); o1.value = age; o1.textContent = age; min.appendChild(o1);
        const o2 = document.createElement("option"); o2.value = age; o2.textContent = age; max.appendChild(o2);
    }
}

// ============================================================
// CONDITIONAL: MARITAL STATUS → children
// ============================================================
const maritalStatusEl = document.getElementById("maritalStatus");
const childrenField   = document.getElementById("childrenField");
const haveChildrenEl  = document.getElementById("haveChildren");

function handleMaritalStatus() {
    const prev = maritalStatusEl.value === "مطلقة" || maritalStatusEl.value === "أرملة";
    childrenField.classList.toggle("hidden", !prev);
    haveChildrenEl.disabled = !prev;
    haveChildrenEl.required = prev;
    if (!prev) haveChildrenEl.value = "0";
    else if (haveChildrenEl.value === "") haveChildrenEl.value = "0";
}
maritalStatusEl.addEventListener("change", handleMaritalStatus);

// ============================================================
// CONDITIONAL: EDUCATION → university major
// ============================================================
const educationEl          = document.getElementById("education");
const universityMajorField = document.getElementById("universityMajorField");
const universityMajorEl    = document.getElementById("universityMajor");

function handleEducation() {
    const show = educationEl.value === "جامعي" || educationEl.value === "دراسات عليا";
    universityMajorField.classList.toggle("hidden", !show);
    if (!show) universityMajorEl.value = "";
}
educationEl.addEventListener("change", handleEducation);

// ============================================================
// CONDITIONAL: IS WORKING → job description
// ============================================================
const isWorkingEl        = document.getElementById("isWorking");
const jobDescriptionField = document.getElementById("jobDescriptionField");

function handleIsWorking() {
    const show = isWorkingEl.value === "true";
    jobDescriptionField.classList.toggle("hidden", !show);
}
isWorkingEl.addEventListener("change", handleIsWorking);

// ============================================================
// MUTUAL EXCLUSIVITY for multi-select groups
// ============================================================
function setupNoMatter(groupName, noMatterId) {
    const noMatter = document.getElementById(noMatterId);
    if (!noMatter) return;
    document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => {
        cb.addEventListener("change", function () {
            if (this.value === "لا يهم" && this.checked) {
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(o => {
                    if (o !== this) o.checked = false;
                });
            } else if (this.value !== "لا يهم" && this.checked) {
                noMatter.checked = false;
            }
        });
    });
}
setupNoMatter("acceptedMaritalStatus", "msNoMatter");
setupNoMatter("groomEducation",         "eduNoMatter");
setupNoMatter("religionLevel",          "rlNoMatter");

// ============================================================
// BUILD JSON — matches Mongoose Schema exactly
// ============================================================
function getFormData() {
    return {
        basicInfo: {
            name:        getValue("name"),
            birthDate:   getValue("birthDate"),
            nationality: getValue("nationality"),
            weight:      getNumberValue("weight"),
            height:      getNumberValue("height"),
            skinColor:   getValue("skinColor"),
            photo:       getValue("photo"),
            description: getValue("description")
        },

        hijab: getRadioValue("hijab"),

        educationAndWork: {
            education:                      getValue("education"),
            universityMajor:                getValue("universityMajor"),
            isWorking:                      getBooleanValue("isWorking"),
            jobDescription:                 getValue("jobDescription"),
            acceptLeaveWorkIfHusbandAsks:   getValue("acceptLeaveWorkIfHusbandAsks")
        },

        residence: {
            city:                    getValue("city"),
            currentPlaceOfResidence: getValue("currentPlaceOfResidence"),
            expatriate:              getValue("expatriate")
        },

        familyInfo: {
            fatherJob:         getValue("fatherJob"),
            motherJob:         getValue("motherJob"),
            siblingsInfo:      getValue("siblingsInfo"),
            parentsSeparated:  getBooleanValue("parentsSeparated"),
            familyDescription: getValue("familyDescription")
        },

        maritalInfo: {
            maritalStatus:  getValue("maritalStatus"),
            marriageType:   getValue("marriageType"),
            haveChildren:   getValue("haveChildren") || "0",
            acceptPolygamy: getValue("acceptPolygamy"),
            wantChildren:   getValue("wantChildren")
        },

        religionAndHealth: {
            prayFiveTimes:         getBooleanValue("prayFiveTimes"),
            quranMemorization:     getNumberValue("quranMemorization"),
            hasDisabilityOrIllness: getValue("hasDisabilityOrIllness")
        },

        groomRequirements: {
            minAge:               getNumberValue("grMinAge"),
            maxAge:               getNumberValue("grMaxAge"),
            acceptedMaritalStatus: getCheckedValues("acceptedMaritalStatus"),
            acceptPolygamy:       getValue("grAcceptPolygamy"),
            education:            getCheckedValues("groomEducation"),
            nationality:          getValue("grNationality"),
            maritalHome:          getValue("grMaritalHome"),
            requiresBeard:        getValue("requiresBeard"),
            requiresPrayer:       getValue("requiresPrayer"),
            requiresNonSmoker:    getValue("requiresNonSmoker"),
            religionLevel:        getCheckedValues("religionLevel"),
            description:          getValue("grDescription")
        },

        contactInfo: {
            whatsapp:        getValue("whatsapp"),
            telegram:        getValue("telegram"),
            facebook:        getValue("facebook"),
            about:           getValue("about"),
            additionalNotes: getValue("additionalNotes")
        }
    };
}

// ============================================================
// VALIDATION
// ============================================================
function showAlert(msg) {
    messageEl.textContent = msg;
    messageEl.className = "message message-error";
    messageEl.classList.remove("hidden");
    messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { if (messageEl.classList.contains("message-error")) messageEl.classList.add("hidden"); }, 5000);
}

function validateCurrentStep() {
    const section = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    messageEl.classList.add("hidden");

    // Standard HTML5 validation
    const inputs = section.querySelectorAll("input, select, textarea");
    for (const inp of inputs) {
        if (inp.required && !inp.disabled && !inp.checkValidity()) {
            inp.reportValidity();
            const label = section.querySelector(`label[for="${inp.id}"]`);
            const name  = label ? label.textContent.replace("*","").trim() : "الحقل";
            showAlert(`يرجى إدخال: ${name}`);
            return false;
        }
    }

    // Step 2: hijab radio required
    if (currentStep === 2) {
        if (!getRadioValue("hijab")) {
            showAlert("يرجى اختيار نوع الحجاب.");
            return false;
        }
    }

    // Step 8: multi-select required fields + age range
    if (currentStep === 8) {
        if (getCheckedValues("acceptedMaritalStatus").length === 0) {
            showAlert("يرجى اختيار الحالة الاجتماعية المقبولة للزوج.");
            return false;
        }
        if (getCheckedValues("groomEducation").length === 0) {
            showAlert("يرجى اختيار المؤهل الدراسي المطلوب للزوج.");
            return false;
        }
        if (getCheckedValues("religionLevel").length === 0) {
            showAlert("يرجى اختيار مستوى التدين المطلوب.");
            return false;
        }
        const minAge = Number(getValue("grMinAge"));
        const maxAge = Number(getValue("grMaxAge"));
        if (minAge && maxAge && minAge > maxAge) {
            showAlert("سن البداية لا يمكن أن يكون أكبر من سن النهاية.");
            return false;
        }
    }

    return true;
}

// ============================================================
// LOCAL STORAGE — SAVE
// ============================================================
function saveDraft() {
    try {
        const data = getFormData();
        data._currentStep = currentStep;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.warn("saveDraft:", e); }
}

// ============================================================
// LOCAL STORAGE — RESTORE
// ============================================================
function restoreDraft() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const d = JSON.parse(saved);

        // Basic
        setValue("name",        d.basicInfo?.name);
        setValue("birthDate",   d.basicInfo?.birthDate);
        setValue("nationality", d.basicInfo?.nationality);
        setValue("weight",      d.basicInfo?.weight);
        setValue("height",      d.basicInfo?.height);
        setValue("skinColor",   d.basicInfo?.skinColor);
        setValue("photo",       d.basicInfo?.photo);
        setValue("description", d.basicInfo?.description);

        // Hijab
        if (d.hijab) setRadioValue("hijab", d.hijab);

        // Education & work
        setValue("education",                     d.educationAndWork?.education);
        setValue("universityMajor",               d.educationAndWork?.universityMajor);
        setValue("jobDescription",                d.educationAndWork?.jobDescription);
        setValue("acceptLeaveWorkIfHusbandAsks",  d.educationAndWork?.acceptLeaveWorkIfHusbandAsks);
        if (d.educationAndWork?.isWorking !== undefined && d.educationAndWork?.isWorking !== null)
            setBooleanValue("isWorking", d.educationAndWork.isWorking);

        // Residence
        setValue("city",                    d.residence?.city);
        setValue("currentPlaceOfResidence", d.residence?.currentPlaceOfResidence);
        setValue("expatriate",              d.residence?.expatriate);

        // Family
        setValue("fatherJob",        d.familyInfo?.fatherJob);
        setValue("motherJob",        d.familyInfo?.motherJob);
        setValue("siblingsInfo",     d.familyInfo?.siblingsInfo);
        setValue("familyDescription",d.familyInfo?.familyDescription);
        if (d.familyInfo?.parentsSeparated !== undefined && d.familyInfo?.parentsSeparated !== null)
            setBooleanValue("parentsSeparated", d.familyInfo.parentsSeparated);

        // Marital
        setValue("maritalStatus",  d.maritalInfo?.maritalStatus);
        setValue("marriageType",   d.maritalInfo?.marriageType);
        setValue("haveChildren",   d.maritalInfo?.haveChildren);
        setValue("acceptPolygamy", d.maritalInfo?.acceptPolygamy);
        setValue("wantChildren",   d.maritalInfo?.wantChildren);

        // Religion
        if (d.religionAndHealth?.prayFiveTimes !== undefined && d.religionAndHealth?.prayFiveTimes !== null)
            setBooleanValue("prayFiveTimes", d.religionAndHealth.prayFiveTimes);
        setValue("quranMemorization",      d.religionAndHealth?.quranMemorization);
        setValue("hasDisabilityOrIllness", d.religionAndHealth?.hasDisabilityOrIllness);

        // Groom requirements
        setValue("grMinAge",         d.groomRequirements?.minAge);
        setValue("grMaxAge",         d.groomRequirements?.maxAge);
        setValue("grAcceptPolygamy", d.groomRequirements?.acceptPolygamy);
        setValue("grNationality",    d.groomRequirements?.nationality);
        setValue("grMaritalHome",    d.groomRequirements?.maritalHome);
        setValue("requiresBeard",    d.groomRequirements?.requiresBeard);
        setValue("requiresPrayer",   d.groomRequirements?.requiresPrayer);
        setValue("requiresNonSmoker",d.groomRequirements?.requiresNonSmoker);
        setValue("grDescription",    d.groomRequirements?.description);
        setCheckedValues("acceptedMaritalStatus", d.groomRequirements?.acceptedMaritalStatus);
        setCheckedValues("groomEducation",        d.groomRequirements?.education);
        setCheckedValues("religionLevel",         d.groomRequirements?.religionLevel);

        // Contact
        setValue("whatsapp",        d.contactInfo?.whatsapp);
        setValue("telegram",        d.contactInfo?.telegram);
        setValue("facebook",        d.contactInfo?.facebook);
        setValue("about",           d.contactInfo?.about);
        setValue("additionalNotes", d.contactInfo?.additionalNotes);

        // Restore conditionals
        handleMaritalStatus();
        handleEducation();
        handleIsWorking();

        // Restore step
        if (d._currentStep && d._currentStep >= 1 && d._currentStep <= TOTAL_STEPS)
            currentStep = d._currentStep;

    } catch (e) { console.error("restoreDraft:", e); }
}

// ============================================================
// CLEAR DRAFT
// ============================================================
clearDraftBtn.addEventListener("click", () => {
    if (confirm("هل أنتِ متأكدة من مسح جميع البيانات المحفوظة والبدء من جديد؟")) {
        localStorage.removeItem(STORAGE_KEY);
        form.reset();
        currentStep = 1;
        handleMaritalStatus();
        handleEducation();
        handleIsWorking();
        showStep(1);
        messageEl.classList.add("hidden");
    }
});

// ============================================================
// AUTO SAVE
// ============================================================
form.addEventListener("input",  saveDraft);
form.addEventListener("change", saveDraft);

// ============================================================
// NAVIGATION
// ============================================================
nextBtn.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    saveDraft();
    if (currentStep < TOTAL_STEPS) { currentStep++; showStep(currentStep); }
});
prevBtn.addEventListener("click", () => {
    if (currentStep > 1) { currentStep--; showStep(currentStep); }
});

// ============================================================
// SUBMIT
// ============================================================
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const data = getFormData();

    // Extra boolean checks
    const checks = [
        [data.religionAndHealth.prayFiveTimes, "يرجى الإجابة على سؤال: هل تحافظين على الصلوات الخمس؟"],
        [data.familyInfo.parentsSeparated,     "يرجى الإجابة على سؤال: هل الوالدان منفصلان؟"],
        [data.educationAndWork.isWorking,      "يرجى الإجابة على سؤال: هل تعملين حالياً؟"]
    ];
    for (const [val, msg] of checks) {
        if (val === null) { showAlert(msg); return; }
    }

    console.log("JSON sent to backend:", data);

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";
    messageEl.classList.add("hidden");

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "حدث خطأ أثناء إرسال البيانات");

        localStorage.removeItem(STORAGE_KEY);
        messageEl.textContent = "✅ تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً.";
        messageEl.className = "message message-success";
        messageEl.classList.remove("hidden");
        form.reset();
        currentStep = 1;
        handleMaritalStatus(); handleEducation(); handleIsWorking();
        showStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
        console.error(err);
        messageEl.textContent = err.message || "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.";
        messageEl.className = "message message-error";
        messageEl.classList.remove("hidden");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "✅ إرسال الطلب";
    }
});

// ============================================================
// INIT
// ============================================================
buildStepDots();
populateAgeOptions();
restoreDraft();
showStep(currentStep);
handleMaritalStatus();
handleEducation();
handleIsWorking();