import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import { Web3Provider } from './contexts/Web3Context';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // 绿色主题，符合农场和鸡蛋追踪的主题
    },
    secondary: {
      main: '#ff9800', // 橙色为辅助色
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// 在DOM中渲染应用
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Web3Provider>
          <App />
        </Web3Provider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
); 