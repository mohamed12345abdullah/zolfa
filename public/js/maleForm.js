"use strict";

// ============================================================
// API ENDPOINT
// ============================================================

const API_URL = "../../api/maleForms/addMaleForm";

// Example: "https://wsal-kappa.vercel.app/api/maleForms/addMaleForm"
// Replace the value above with your actual endpoint.

// ============================================================
// ELEMENT REFERENCES
// ============================================================

const form               = document.getElementById("marriageForm");
const steps              = document.querySelectorAll(".form-step");
const nextBtn            = document.getElementById("nextBtn");
const prevBtn            = document.getElementById("prevBtn");
const submitBtn          = document.getElementById("submitBtn");
const clearDraftBtn      = document.getElementById("clearDraftBtn");
const progressBar        = document.getElementById("progress");
const stepTitle          = document.getElementById("stepTitle");
const currentStepEl      = document.getElementById("currentStep");
const totalStepsEl       = document.getElementById("totalSteps");
const stepDotsContainer  = document.getElementById("stepDots");
const messageEl          = document.getElementById("message");

const maritalStatusEl    = document.getElementById("maritalStatus");
const childrenField      = document.getElementById("childrenField");
const haveChildrenEl     = document.getElementById("haveChildren");
const educationEl        = document.getElementById("education");
const universityMajorField = document.getElementById("universityMajorField");
const universityMajorEl  = document.getElementById("universityMajor");
const hijabCheckboxes    = document.querySelectorAll('input[name="hijab"]');

const STORAGE_KEY        = "marriage_form_draft";
const TOTAL_STEPS        = steps.length;

let currentStep = 1;

const stepTitles = [
    "البيانات الأساسية",
    "التعليم والعمل",
    "السكن والإقامة",
    "معلومات الأسرة",
    "الحالة الاجتماعية والزواج",
    "الدين والصحة",
    "مواصفات الزوجة المطلوبة",
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
    const val = getValue(id);
    if (val === "") return null;
    return val === "true";
}

function setBooleanValue(id, value) {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null) return;
    el.value = String(value); // "true" or "false"
}

function getNumberValue(id) {
    const val = getValue(id);
    if (val === "" || val === null) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
}

// ============================================================
// STEP DOTS — build once
// ============================================================

function buildStepDots() {
    totalStepsEl.textContent = TOTAL_STEPS;
    stepDotsContainer.innerHTML = "";
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const dot = document.createElement("div");
        dot.className = "step-dot";
        dot.textContent = i;
        dot.id = `dot-${i}`;
        stepDotsContainer.appendChild(dot);
    }
}

function updateStepDots(active) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (!dot) continue;
        dot.className = "step-dot";
        if (i < active)  dot.classList.add("done");
        if (i === active) dot.classList.add("active");
    }
}

// ============================================================
// SHOW STEP
// ============================================================

function showStep(step) {
    steps.forEach(s => s.classList.remove("active"));

    const activeSection = document.querySelector(`.form-step[data-step="${step}"]`);
    if (activeSection) activeSection.classList.add("active");

    currentStepEl.textContent = step;
    stepTitle.textContent = stepTitles[step - 1] || "";

    const pct = (step / TOTAL_STEPS) * 100;
    progressBar.style.width = `${pct}%`;

    prevBtn.classList.toggle("hidden", step === 1);
    nextBtn.classList.toggle("hidden", step === TOTAL_STEPS);
    submitBtn.classList.toggle("hidden", step !== TOTAL_STEPS);

    updateStepDots(step);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
// AGE OPTIONS
// ============================================================

function populateAgeOptions() {
    const minAge = document.getElementById("minAge");
    const maxAge = document.getElementById("maxAge");

    for (let age = 16; age <= 80; age++) {
        const o1 = document.createElement("option");
        o1.value = age;
        o1.textContent = age;
        minAge.appendChild(o1);

        const o2 = document.createElement("option");
        o2.value = age;
        o2.textContent = age;
        maxAge.appendChild(o2);
    }
}

// ============================================================
// CONDITIONAL: MARITAL STATUS → children
// ============================================================

function handleMaritalStatus() {
    const status = maritalStatusEl.value;
    const hasPrevMarriage = status === "مطلق" || status === "أرمل";

    if (hasPrevMarriage) {
        childrenField.classList.remove("hidden");
        haveChildrenEl.disabled = false;
        haveChildrenEl.required = true;
        if (haveChildrenEl.value === "") haveChildrenEl.value = "0";
    } else {
        childrenField.classList.add("hidden");
        haveChildrenEl.value = "0";
        haveChildrenEl.disabled = true;
        haveChildrenEl.required = false;
    }
}

maritalStatusEl.addEventListener("change", handleMaritalStatus);

// ============================================================
// CONDITIONAL: EDUCATION → university major
// ============================================================

function handleEducation() {
    const val = educationEl.value;
    const show = val === "جامعي" || val === "دراسات عليا";

    if (show) {
        universityMajorField.classList.remove("hidden");
    } else {
        universityMajorField.classList.add("hidden");
        universityMajorEl.value = "";
    }
}

educationEl.addEventListener("change", handleEducation);

// ============================================================
// HIJAB CHECKBOXES — mutual exclusivity with "لا يهم"
// ============================================================

hijabCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        const noMatter = document.querySelector('input[name="hijab"][value="لا يهم"]');

        if (this.value === "لا يهم" && this.checked) {
            hijabCheckboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        } else if (this.value !== "لا يهم" && this.checked) {
            if (noMatter) noMatter.checked = false;
        }
    });
});

function getHijabValues() {
    return Array.from(
        document.querySelectorAll('input[name="hijab"]:checked')
    ).map(cb => cb.value);
}

// ============================================================
// BUILD JSON — exactly matching Mongoose Schema
// ============================================================

function getFormData() {
    return {
        basicInfo: {
            name:         getValue("name"),
            birthDate:    getValue("birthDate"),
            nationality:  getValue("nationality"),
            weight:       getNumberValue("weight"),
            height:       getNumberValue("height"),
            skinColor:    getValue("skinColor"),
            photo:        getValue("photo"),
            description:  getValue("description")
        },

        educationAndWork: {
            education:       getValue("education"),
            universityMajor: getValue("universityMajor"),
            job:             getValue("job"),
            jobDescription:  getValue("jobDescription")
        },

        residence: {
            city:                    getValue("city"),
            currentPlaceOfResidence: getValue("currentPlaceOfResidence"),
            expatriate:              getValue("expatriate"),
            maritalHome:             getValue("maritalHome"),
            maritalHomeDescription:  getValue("maritalHomeDescription")
        },

        familyInfo: {
            fatherJob:        getValue("fatherJob"),
            motherJob:        getValue("motherJob"),
            siblingsInfo:     getValue("siblingsInfo"),
            parentsSeparated: getBooleanValue("parentsSeparated")
        },

        maritalInfo: {
            maritalStatus: getValue("maritalStatus"),
            marriageType:  getValue("marriageType"),
            haveChildren:  getValue("haveChildren") || "0",
            polygamy:      getValue("polygamy"),
            wantChildren:  getValue("wantChildren")
        },

        religionAndHealth: {
            smoker:              getBooleanValue("smoker"),
            bearded:             getBooleanValue("bearded"),
            prayFiveTimes:       getBooleanValue("prayFiveTimes"),
            prayInMosque:        getValue("prayInMosque"),
            quranMemorization:   getNumberValue("quranMemorization"),
            hasDisabilityOrIllness: getValue("hasDisabilityOrIllness")
        },

        brideRequirements: {
            minAge:      getNumberValue("minAge"),
            maxAge:      getNumberValue("maxAge"),
            description: getValue("brideDescription"),
            education:   getValue("brideEducation"),
            hijab:       getHijabValues()
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

function showFieldError(input, msg) {
    input.reportValidity(); // native browser tooltip

    // Also mark the field visually
    input.style.borderColor = "var(--clr-danger)";
    input.style.boxShadow   = "0 0 0 3px rgba(192,57,43,0.15)";
    input.addEventListener("input", () => {
        input.style.borderColor = "";
        input.style.boxShadow   = "";
    }, { once: true });
    input.addEventListener("change", () => {
        input.style.borderColor = "";
        input.style.boxShadow   = "";
    }, { once: true });
}

function showAlert(msg) {
    // Custom inline alert — replace window.alert for a nicer UX
    messageEl.textContent = msg;
    messageEl.className = "message message-error";
    messageEl.classList.remove("hidden");
    messageEl.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
        if (messageEl.classList.contains("message-error")) {
            messageEl.classList.add("hidden");
        }
    }, 5000);
}

function validateCurrentStep() {
    const section = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs  = section.querySelectorAll("input, select, textarea");

    // Hide any previous message
    messageEl.classList.add("hidden");

    for (const input of inputs) {
        if (input.required && !input.disabled && !input.checkValidity()) {
            showFieldError(input);
            const label = section.querySelector(`label[for="${input.id}"]`);
            const fieldName = label ? label.textContent.replace("*", "").trim() : "الحقل";
            showAlert(`يرجى إدخال: ${fieldName}`);
            return false;
        }
    }

    // Step 7: age range
    if (currentStep === 7) {
        const minAge = Number(getValue("minAge"));
        const maxAge = Number(getValue("maxAge"));

        if (minAge && maxAge && minAge > maxAge) {
            showAlert("سن البداية لا يمكن أن يكون أكبر من سن النهاية.");
            return false;
        }

        const hijab = getHijabValues();
        if (hijab.length === 0) {
            showAlert("يرجى اختيار نوع الحجاب المقبول على الأقل.");
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
    } catch (e) {
        console.warn("saveDraft failed:", e);
    }
}

// ============================================================
// LOCAL STORAGE — RESTORE
// ============================================================

function restoreDraft() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        // Basic Info
        setValue("name",         data.basicInfo?.name);
        setValue("birthDate",    data.basicInfo?.birthDate);
        setValue("nationality",  data.basicInfo?.nationality);
        setValue("weight",       data.basicInfo?.weight);
        setValue("height",       data.basicInfo?.height);
        setValue("skinColor",    data.basicInfo?.skinColor);
        setValue("photo",        data.basicInfo?.photo);
        setValue("description",  data.basicInfo?.description);

        // Education & Work
        setValue("education",       data.educationAndWork?.education);
        setValue("universityMajor", data.educationAndWork?.universityMajor);
        setValue("job",             data.educationAndWork?.job);
        setValue("jobDescription",  data.educationAndWork?.jobDescription);

        // Residence
        setValue("city",                    data.residence?.city);
        setValue("currentPlaceOfResidence", data.residence?.currentPlaceOfResidence);
        setValue("expatriate",              data.residence?.expatriate);
        setValue("maritalHome",             data.residence?.maritalHome);
        setValue("maritalHomeDescription",  data.residence?.maritalHomeDescription);

        // Family Info
        setValue("fatherJob",    data.familyInfo?.fatherJob);
        setValue("motherJob",    data.familyInfo?.motherJob);
        setValue("siblingsInfo", data.familyInfo?.siblingsInfo);

        const ps = data.familyInfo?.parentsSeparated;
        if (ps !== undefined && ps !== null) setBooleanValue("parentsSeparated", ps);

        // Marital Info
        setValue("maritalStatus", data.maritalInfo?.maritalStatus);
        setValue("marriageType",  data.maritalInfo?.marriageType);
        setValue("haveChildren",  data.maritalInfo?.haveChildren);
        setValue("polygamy",      data.maritalInfo?.polygamy);
        setValue("wantChildren",  data.maritalInfo?.wantChildren);

        // Religion & Health
        const smoker        = data.religionAndHealth?.smoker;
        const bearded       = data.religionAndHealth?.bearded;
        const prayFiveTimes = data.religionAndHealth?.prayFiveTimes;

        if (smoker        !== undefined && smoker        !== null) setBooleanValue("smoker",        smoker);
        if (bearded       !== undefined && bearded       !== null) setBooleanValue("bearded",       bearded);
        if (prayFiveTimes !== undefined && prayFiveTimes !== null) setBooleanValue("prayFiveTimes", prayFiveTimes);

        setValue("prayInMosque",        data.religionAndHealth?.prayInMosque);
        setValue("quranMemorization",   data.religionAndHealth?.quranMemorization);
        setValue("hasDisabilityOrIllness", data.religionAndHealth?.hasDisabilityOrIllness);

        // Bride Requirements
        setValue("minAge",         data.brideRequirements?.minAge);
        setValue("maxAge",         data.brideRequirements?.maxAge);
        setValue("brideDescription", data.brideRequirements?.description);
        setValue("brideEducation", data.brideRequirements?.education);

        if (Array.isArray(data.brideRequirements?.hijab)) {
            hijabCheckboxes.forEach(cb => {
                cb.checked = data.brideRequirements.hijab.includes(cb.value);
            });
        }

        // Contact Info
        setValue("whatsapp",        data.contactInfo?.whatsapp);
        setValue("telegram",        data.contactInfo?.telegram);
        setValue("facebook",        data.contactInfo?.facebook);
        setValue("about",           data.contactInfo?.about);
        setValue("additionalNotes", data.contactInfo?.additionalNotes);

        // Restore conditional fields
        handleMaritalStatus();
        handleEducation();

        // Restore step
        const savedStep = data._currentStep;
        if (savedStep && savedStep >= 1 && savedStep <= TOTAL_STEPS) {
            currentStep = savedStep;
        }

    } catch (err) {
        console.error("restoreDraft failed:", err);
    }
}

// ============================================================
// CLEAR DRAFT
// ============================================================

clearDraftBtn.addEventListener("click", () => {
    if (confirm("هل أنت متأكد من مسح جميع البيانات المحفوظة والبدء من جديد؟")) {
        localStorage.removeItem(STORAGE_KEY);
        form.reset();
        currentStep = 1;
        handleMaritalStatus();
        handleEducation();
        hijabCheckboxes.forEach(cb => { cb.checked = false; });
        showStep(1);
        messageEl.classList.add("hidden");
    }
});

// ============================================================
// AUTO SAVE on any input/change
// ============================================================

form.addEventListener("input",  saveDraft);
form.addEventListener("change", saveDraft);

// ============================================================
// NAVIGATION
// ============================================================

nextBtn.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    saveDraft();
    if (currentStep < TOTAL_STEPS) {
        currentStep++;
        showStep(currentStep);
    }
});

prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
});

// ============================================================
// SUBMIT
// ============================================================

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    const data = getFormData();

    // Final safety check: remove any undefined booleans
    if (data.familyInfo.parentsSeparated === null) {
        showAlert("يرجى الإجابة على سؤال: هل الوالدان منفصلان؟");
        return;
    }
    if (data.religionAndHealth.smoker === null) {
        showAlert("يرجى الإجابة على سؤال: هل أنت مدخن؟");
        return;
    }
    if (data.religionAndHealth.bearded === null) {
        showAlert("يرجى الإجابة على سؤال: هل أنت ملتحٍ؟");
        return;
    }
    if (data.religionAndHealth.prayFiveTimes === null) {
        showAlert("يرجى الإجابة على سؤال: هل تحافظ على الصلوات الخمس؟");
        return;
    }

    console.log("JSON sent to backend:", data);

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";

    messageEl.classList.add("hidden");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "حدث خطأ أثناء إرسال البيانات");
        }

        // Success
        localStorage.removeItem(STORAGE_KEY);

        messageEl.textContent = "✅ تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً.";
        messageEl.className = "message message-success";
        messageEl.classList.remove("hidden");

        form.reset();
        currentStep = 1;
        handleMaritalStatus();
        handleEducation();
        hijabCheckboxes.forEach(cb => { cb.checked = false; });
        showStep(1);

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
        console.error(error);
        messageEl.textContent = error.message || "حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.";
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