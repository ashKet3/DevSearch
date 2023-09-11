import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App.tsx'
import './styles/index.css'

const theme = extendTheme({
    colors: {
        primary: '#141519',
        secondary: '#232329',
        tertiary: '#990033',
        brand: '#008080',
        brandHover: '#014D4E'
    },
    fonts: {
        heading: 'Lexend Deca, sans-serif',
        body: 'Poppins, sans-serif',
    },
    styles: {
        global: {
            body: {
                bg: "primary",
            },
        },
    },
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>,
)
