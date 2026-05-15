/* global React, IOSFrame */
const { useState } = React;

const App = () => {
  const [stage, setStage] = useState('splash'); // splash | login | app
  const [tab, setTab] = useState('home');
  const [qr, setQr] = useState(false);
  const [sheet, setSheet] = useState(null);
  const user = window.UF_DATA.user;

  const screen = () => {
    if (stage === 'splash') return <SplashScreen onDone={() => setStage('login')} />;
    if (stage === 'login')  return <LoginScreen onLogin={() => setStage('app')} />;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#F7F6FB' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {tab === 'home'    && <HomeScreen user={user} onAction={setTab} onShowQR={() => setQr(true)} />}
          {tab === 'explore' && <ExploreScreen onSelect={setSheet} />}
          {tab === 'plans'   && <PlansScreen />}
          {tab === 'profile' && <ProfileScreen user={user} />}
        </div>
        <TabBar active={tab} onChange={setTab} />
        <BottomSheet open={!!sheet} onClose={() => setSheet(null)}>
          {sheet && (
            <div>
              <div style={{ font: '900 22px Inter', color: '#1A1728' }}>{sheet.name}</div>
              <div style={{ font: '400 13px Inter', color: '#A09CC0', marginTop: 4, marginBottom: 14 }}>{sheet.distance} km · {sheet.address}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                {sheet.classes.map(c => <span key={c} style={{ background: 'rgba(159,153,199,.2)', color: '#3C0008', padding: '5px 12px', borderRadius: 999, font: '600 12px Inter' }}>{c}</span>)}
              </div>
              <PrimaryButton label="Generate New Pass" icon="qr" onPress={() => { setSheet(null); setQr(true); }} full />
            </div>
          )}
        </BottomSheet>
        {qr && <QRPass onClose={() => setQr(false)} />}
      </div>
    );
  };

  return (
    <IOSFrame statusBarStyle={stage === 'login' ? 'light' : 'dark'} time="9:41">
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F7F6FB', fontFamily: 'Inter' }}>
        {screen()}
      </div>
    </IOSFrame>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
