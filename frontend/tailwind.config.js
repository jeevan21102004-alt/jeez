export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#FF6584',
        success: '#43D9AD',
        warning: '#FFB347',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
      },
    },
  },
};
