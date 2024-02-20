import {
  Icon16DeleteOutline,
  Icon16PenOutline,
  Icon24RefreshOutline,
  Icon28CheckCircleOutline,
  Icon28VolumeOutline,
} from "@vkontakte/icons";
import { Div, Group, IconButton, SimpleCell, Snackbar, Tooltip } from "@vkontakte/vkui";
import { joinCall } from "../../../bridge/bridgeLib";
import { Locales } from "../../../locales/locales";
import { useContext, useEffect, useState } from "react";
import { AlertManagerContext, TipAlert } from "../../contexts/AlertProvider";
import useChannelTip from './hooks/ChannelTip'; // Предполагается, что этот хук будет создан
import { openSuccess } from "../../Snackbar";

export default function ChannelView({ channel, channelIndex, editModeActive, renameToChannel, refreshChannel, deleteToChannel, userIsAdmin }) {
  const alerts = useContext(AlertManagerContext);
  const { isTipShown, setTipShown } = useChannelTip(channelIndex);
  const [text, setText] = useState('');
  const [snackbar, setSnackbar] = useState(null);

  

  const joinChannel = () => {
    const isFirstCall = localStorage.getItem("isFirstCall");
    if (!userIsAdmin || isFirstCall !== null) {
      joinCall(channel.joinlink, () => {});
      return;
    }

    localStorage.setItem("isFirstCall", "false");
    alerts.showAlert(TipAlert({ message: Locales.Hints.DontKillCall, alertManager: alerts, onClose: joinChannel }));
  };

  const handleIconButtonClick = (action) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <SimpleCell
      before={<Icon28VolumeOutline />}
      after={userIsAdmin && (
        <Tooltip
          isShown={isTipShown}
          text={Locales.Hints.RefreshChannel}
          onClick={handleIconButtonClick}
          onClose={() => setTipShown(false)}
        >
          <IconButton onClick={handleIconButtonClick(() => { 
             refreshChannel(); 
  openSuccess(snackbar, setSnackbar);
})}>
            <Icon24RefreshOutline />
          </IconButton>
        </Tooltip>
      )}
      onClick={joinChannel}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {editModeActive && (
          <>
            <IconButton onClick={handleIconButtonClick(() => renameToChannel())}>
              <Icon16PenOutline />
            </IconButton>
            <IconButton
              style={{ color: 'red' }}
              onClick={handleIconButtonClick(() => deleteToChannel(channelIndex))}
            >
              <Icon16DeleteOutline />
            </IconButton>
          </>
        )}
                {channel.name}
      </div>
      <>
        {snackbar}
        </>
    </SimpleCell>
    
  );
}
