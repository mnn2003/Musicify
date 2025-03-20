import { Toaster as HotToaster } from 'react-hot-toast';

const Toaster = () => {
  return (
    <HotToaster
      position="bottom-center"
      toastOptions={{
        className: 'bg-gray-800 text-white',
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default Toaster;
