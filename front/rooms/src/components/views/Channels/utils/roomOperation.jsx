import { deleteRoom, editChannel } from '../../../../serverApi/serverApi';

export const roomOperation = (roomManager, alerts) => ({

  createChannel: function (channelName) {
    const newRoom = roomManager.createChannel(channelName)
    editChannel(newRoom)
      .then((room) => {
        console.log("sucessful")
      })
      .catch((error) => {
        console.log(error)
        alerts.showAlert(
          ErrorAlert({
            message: Locales.Errors.FailedCreateRoom,
            alertManager: alerts,
          })
        );
      });
  },

  renameChannel: function (newNameChannel, renameChannelId) {
    const updateRoom = roomManager.renameChannel(newNameChannel, renameChannelId)
    editChannel(updateRoom)
      .then((room) => {
      })
      .catch((error) => {
        console.log(error)
        alerts.showAlert(
          ErrorAlert({
            message: Locales.Errors.FailedCreateRoom,
            alertManager: alerts,
          })
        );
      });
  },

  deleteChannel: function (delChannenlId) {
    const updateRoom = roomManager.deleteChannel(delChannenlId)
    editChannel(updateRoom)
      .then((room) => {
        redrawRoom()
      })
      .catch((error) => {
        console.log(error)
        alerts.showAlert(
          ErrorAlert({
            message: Locales.Errors.FailedCreateRoom,
            alertManager: alerts,
          })
        );
      });
  },

  refreshChannel: function (channelId) {
    const updateRoom = roomManager.refreshChannel(channelId)
    editChannel(updateRoom)
      .then((room) => {
        redrawRoom()
      })
      .catch((error) => {
        console.log(error)
        alerts.showAlert(
          ErrorAlert({
            message: Locales.Errors.FailedCreateRoom,
            alertManager: alerts,
          })
        );
      });
  },

  deleteRoom: function(roomId, returnBack) {
  deleteRoom(roomId)
    .then((response) => {
      returnBack(); 
    })
    .catch((error) => {
      console.log(error);
      alerts.showAlert(
        ErrorAlert({
          message: Locales.Errors.FailedCreateRoom, 
          alertManager: alerts,
        })
      );
    }); 
},

  deleteMember: function(memberId) {
    const updateRoom = roomManager.deleteMember(memberId)
    editChannel(updateRoom)
      .this((room) => {

      })
      .catch((error) => {
        console.log(error)
        alerts.showAlert(
          ErrorAlert({
            message: Locales.Errors.FailedCreateRoom,
            alertManager: alerts,
          })
        );
      });
  },

});