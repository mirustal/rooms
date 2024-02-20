import React, { useContext } from 'react';
import {
    AdaptivityProvider,
    ConfigProvider,
    AppRoot,
    SplitLayout,
    SplitCol,
    PanelHeader,
    usePlatform,
    Platform,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import Main from './components/Main';
import AlertProvider, { AlertContext } from './components/contexts/AlertProvider';
import Modals from './components/Modals';

const AppWrapper = ({children}) => {
    return (
        <ConfigProvider>
            <AdaptivityProvider>
                <AppRoot>
                    <AlertProvider>
                        {children}
                    </AlertProvider>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
        );
}

function AppContent() {
    const alert = useContext(AlertContext)
    const modal = Modals()
    const platform = usePlatform();
    const hasHeader = platform !== Platform.VKCOM;

    return (
        <SplitLayout popout={alert} modal={modal} 
        style={{ justifyContent: 'center' }}
        header={hasHeader && <PanelHeader separator={false} />}>
            <SplitCol stretchedOnMobile autoSpaced>
                <Main />
            </SplitCol>
        </SplitLayout>
    )
}

export default function App() {
	return (
	<AppWrapper>
        <AppContent />
	</AppWrapper>
	);
};