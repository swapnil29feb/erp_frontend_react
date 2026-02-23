import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppRouter from './router/AppRouter';
import './App.css';
import { ConfigProvider, theme } from "antd";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { dark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: dark
          ? theme.darkAlgorithm
          : theme.defaultAlgorithm,
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;