    import { Icon16Done, Icon24ThumbsUpOutline, Icon28CheckCircleOutline, Icon28EditOutline } from "@vkontakte/icons";
    import { Snackbar } from "@vkontakte/vkui";

     export const  openSuccess = (snackbar, setSnackbar) => {
        if (snackbar) return;
        setSnackbar(
        <Snackbar
            onClose={() => setSnackbar(null)}
            before={<Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />}
        >
            Звонок обновлен
        </Snackbar>,
        );
    };

    export const openBaseWithAction = (snackbar, setSnackbar, editModeActive) => {
        if (snackbar) return;
        setSnackbar(
          <Snackbar
            onClose={() => setSnackbar(null)}
            before={<Icon28EditOutline fill="var(--vkui--color_icon_accent)" />}
          >
            {editModeActive ? "Редактирование выключено" : "Редактирование включено"}
          </Snackbar>
        );
    };