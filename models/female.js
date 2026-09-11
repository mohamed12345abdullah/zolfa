const mongoose = require("mongoose");

const femaleSchema = new mongoose.Schema({

    basicInfo: {
        name: {
            type: String,
            required: [true, "name is required"],
            minlength: [3, "name must be at least 3 characters"],
            trim: true
        },
        birthDate: {
            type: Date,
            required: [true, "birth date is required"]
        },
        nationality: {
            type: String,
            required: [true, "nationality is required"]
        },
        weight: {
            type: Number,
            required: [true, "weight is required"]
        },
        height: {
            type: Number,
            required: [true, "height is required"]
        },
        skinColor: {
            type: String,
            required: [true, "skin color is required"],
            enum: [
                "اسمر داكن",
                "اسمر",
                "قمحى غامق",
                "قمحى فاتح",
                "ابيض",
                "ابيض فاتح جدا"
            ]
        },
        description: {
            type: String,
            trim: true
        }
    },

    // -------------------------------------------------------
    // الحجاب — الأنثى نفسها (single select)
    // -------------------------------------------------------
    hijab: {
        type: String,
        required: [true, "hijab type is required"],
        enum: [
            "نقاب ألوان",
            "نقاب أسود كامل",
            "نقاب أسود كامل مع جوانتي",
            "منتقبة نقاب كامل",
            "منتقبة فقط",
            "محجبة مختمرة",
            "محجبة"
        ]
    },

    // -------------------------------------------------------
    // التعليم والعمل
    // -------------------------------------------------------
    educationAndWork: {
        education: {
            type: String,
            required: [true, "education is required"]
        },
        universityMajor: {
            type: String
        },
        isWorking: {
            type: Boolean,
            required: [true, "working status is required"]
        },
        jobDescription: {
            type: String,
            trim: true
        },
        acceptLeaveWorkIfHusbandAsks: {
            type: String,
            required: [true, "this field is required"],
            enum: ["نعم", "لا", "حسب الاتفاق"]
        }
    },

    // -------------------------------------------------------
    // السكن والإقامة
    // -------------------------------------------------------
    residence: {
        city: {
            type: String
        },
        currentPlaceOfResidence: {
            type: String
        },
        expatriate: {
            type: String,
            required: [true, "expatriate is required"],
            enum: ["نعم", "لا", "حسب الاتفاق"]
        }
    },

    // -------------------------------------------------------
    // معلومات الأسرة
    // -------------------------------------------------------
    familyInfo: {
        fatherJob: {
            type: String,
            trim: true
        },
        motherJob: {
            type: String,
            trim: true
        },
        siblingsInfo: {
            type: String,
            required: [true, "siblings info is required"],
            trim: true
        },
        parentsSeparated: {
            type: Boolean,
            required: [true, "parents separated is required"]
        },
        familyDescription: {
            type: String,
            trim: true
        }
    },

    // -------------------------------------------------------
    // الحالة الاجتماعية والزواج
    // -------------------------------------------------------
    maritalInfo: {
        maritalStatus: {
            type: String,
            required: [true, "marital status is required"],
            enum: [
                "عذراء",
                "أعزب سبق لها عقد أو كتب كتاب",
                "مطلقة",
                "أرملة"
            ]
        },
        marriageType: {
            type: String,
            required: [true, "marriage type is required"],
            enum: [
                "زواج بقائمة منقولات",
                "زواج شرعي بدون قائمة",
                "على حسب الاتفاق"
            ]
        },
        haveChildren: {
            type: String,
            required: [true, "have children is required"],
            default: "0"
        },
        acceptPolygamy: {
            type: String,
            required: [true, "polygamy acceptance is required"],
            enum: ["نعم", "لا", "حسب الاتفاق"]
        },
        wantChildren: {
            type: String,
            required: [true, "want children is required"],
            enum: ["نعم", "لا", "أفضل تأخير الانجاب"]
        }
    },

    // -------------------------------------------------------
    // الدين والصحة
    // -------------------------------------------------------
    religionAndHealth: {
        prayFiveTimes: {
            type: Boolean,
            required: [true, "pray five times is required"]
        },
        quranMemorization: {
            type: Number,
            required: [true, "quran memorization is required"],
            min: [0, "cannot be negative"],
            max: [30, "cannot exceed 30"]
        },
        hasDisabilityOrIllness: {
            type: String,
            required: [true, "this field is required"]
        }
    },

    // -------------------------------------------------------
    // مواصفات الزوج المطلوب
    // -------------------------------------------------------
    groomRequirements: {
        minAge: {
            type: Number,
            required: [true, "min age is required"],
            min: [18, "min age must be at least 18"]
        },
        maxAge: {
            type: Number,
            required: [true, "max age is required"],
            max: [80, "max age cannot exceed 80"]
        },
        // الحالة الاجتماعية المقبولة — multi-select
        acceptedMaritalStatus: {
            type: [String],
            required: [true, "accepted marital status is required"],
            enum: ["أعزب", "مطلق", "أرمل", "لا يهم"]
        },
        acceptPolygamy: {
            type: String,
            required: [true, "polygamy is required"],
            enum: ["نعم", "لا", "حسب الاتفاق"]
        },
        // المؤهل الدراسي المقبول — multi-select
        education: {
            type: [String],
            required: [true, "education is required"],
            enum: [
                "بدون مؤهل",
                "متوسط",
                "فوق المتوسط",
                "جامعي",
                "دراسات عليا",
                "غير مهم"
            ]
        },
        nationality: {
            type: String,
            trim: true
        },
        // السكن الزوجي المطلوب
        maritalHome: {
            type: String,
            required: [true, "marital home preference is required"],
            enum: [
                "شقة مستقلة",
                "مع أهل الزوج",
                "حسب الاتفاق"
            ]
        },
        // الالتزام الديني
        requiresBeard: {
            type: String,
            required: [true, "beard requirement is required"],
            enum: ["نعم", "لا", "لا يهم"]
        },
        requiresPrayer: {
            type: String,
            required: [true, "prayer requirement is required"],
            enum: ["نعم", "لا", "لا يهم"]
        },
        requiresNonSmoker: {
            type: String,
            required: [true, "non-smoker requirement is required"],
            enum: ["نعم", "لا", "لا يهم"]
        },
        religionLevel: {
            type: [String],
            required: [true, "religion level is required"],
            enum: ["ملتزم جداً", "ملتزم", "متوسط الالتزام", "لا يهم"]
        },
        description: {
            type: String,
            trim: true
        }
    },

    // -------------------------------------------------------
    // معلومات التواصل
    // -------------------------------------------------------
    contactInfo: {
        whatsapp: {
            type: String,
            required: [true, "whatsapp is required"],
            trim: true
        },
        telegram: {
            type: String,
            trim: true
        },
        facebook: {
            type: String,
            trim: true
        },
        about: {
            type: String,
            required: [true, "about is required"],
            trim: true
        },
        additionalNotes: {
            type: String,
            trim: true
        }
    },

    public: {
        type: Boolean,
        default: false
    },

    deleted: {
        type: Boolean,
        default: false
    },
    requestsSent: {
        type: Array,
        default: []
    },
    requestsReceived: {
        type: Array,
        default: []
    }

}, 
{ timestamps: true });

const Female = mongoose.model("Female", femaleSchema);
module.exports = Female;