export class RoomManager {
    constructor(room, updateRoomCallback) {
      this.room = room;
      this.updateRoom = updateRoomCallback;
    }
  
    createChannel(channelName) {
      const channels = this.room.channels;
      const newChannel = {
        id: channels.length === 0 ? 1 : channels[channels.length - 1].id + 1,
        name: channelName
      };
      this.room.channels = [...channels, newChannel];
      this.updateRoom(this.room);
      return this.room;
    }
  
    renameChannel(newNameChannel, channelId) {
      this.room.channels = this.room.channels.map(channel => 
        channel.id === channelId ? { ...channel, name: newNameChannel } : channel
      );
      this.updateRoom(this.room);
      return this.room;
    }
  
    deleteChannel(channelId) {
      this.room.channels = this.room.channels.filter(channel => channel.id !== channelId);
      this.updateRoom(this.room);
      return this.room;
    }
  
    refreshChannel(channelId) {
      this.room.channels = this.room.channels.map(channel => 
        channel.id === channelId ? { ...channel, joinlink: null } : channel
      );
      this.updateRoom(this.room);
      return this.room;
    }

    updateStateRoom(room){
      this.updateRoom(room)
    }

    deleteMember(memberId){
      this.room.members = this.room.members.filter(member => member.id !== memberId);
      this.updateRoom(this.room)
      return this.room

    }
  }


  
