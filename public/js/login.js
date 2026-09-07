
const showMessage = (type, message) => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        if (type === 'error') {
            messageElement.style.color = 'red';
        } else {
            messageElement.style.color = 'green';
        }
        setTimeout(() => {
            messageElement.textContent = '';
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');

    // التحقق من حالة تسجيل الدخول

    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Login form not found');
        return;
    }

    // منع السلوك الافتراضي للنموذج
    form.onsubmit = async (e) => {
        e.preventDefault(); // منع إعادة تحميل الصفحة
        console.log('Form submitted');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            // utils.showToast("جميع الحقول مطلوبة", true);
            
            return false; // منع إرسال النموذج
        }


        try {
            const response = await fetch('../../api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // utils.showToast("تم تسجيل الدخول بنجاح");
                showMessage('success', 'تم تسجيل الدخول بنجاح');
                redirectBasedOnRole(data.user);
            } else {
                throw new Error(data.message || "فشل تسجيل الدخول");
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('error', error.message || "حدث خطأ في الاتصال بالخادم");
        } finally {
            // utils.toggleLoading(false);
            // showMessage('error', 'error occurred');
        }

        return false; // منع إرسال النموذج
    };
});

// دالة مساعدة للتوجيه حسب دور المستخدم
function redirectBasedOnRole(user) {
    switch(user.role) {
        case 'manager':
            window.location.href = './manager-dashboard.html';
            break;
        case 'Male':
            window.location.href = './instructor-dashboard.html';
            break;
        case 'Female':
            window.location.href = './instructor-dashboard.html';
            break;
        case 'admin':
            window.location.href = './reviews.html';
            break;
        default:
            window.location.href = './profile.html';
    }
} 