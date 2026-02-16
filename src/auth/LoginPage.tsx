import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
            padding: '20px',
        },
        card: {
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
        },
        header: {
            textAlign: 'center' as const,
            marginBottom: '32px',
        },
        logoContainer: {
            width: '48px',
            height: '48px',
            backgroundColor: '#2563eb',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
        },
        title: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '4px',
        },
        subtitle: {
            fontSize: '14px',
            color: '#6b7280',
        },
        formGroup: {
            marginBottom: '20px',
        },
        label: {
            display: 'block',
            marginBottom: '6px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
        },
        input: {
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box' as const,
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            transition: 'background-color 0.2s',
        },
        error: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center' as const,
            border: '1px solid #fee2e2',
        }
    };

    return (
        <div style={styles.container}>
            <div className="fade-in-up" style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logoContainer}>L</div>
                    <h2 style={styles.title}>Lighting ERP</h2>
                    <p style={styles.subtitle}>Sign in to continue</p>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Enter your username"
                            required
                            disabled={isLoggingIn}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                            disabled={isLoggingIn}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            backgroundColor: isLoggingIn ? '#60a5fa' : '#2563eb',
                            cursor: isLoggingIn ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn && <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>}
                        {isLoggingIn ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
