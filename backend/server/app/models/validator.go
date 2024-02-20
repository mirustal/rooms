package models

import "room_app/pgk/errors"

const max_str_length = 256
const max_channels_count = 30

func ValidateRoom(room *Room) error {
	if room == nil {
		return errors.DataValidationError("room is nil")
	}

	if len([]rune(room.AvatarURL)) > max_str_length {
		return errors.DataValidationError("too long avatar url")
	}

	if len([]rune(room.RoomName)) > max_str_length {
		return errors.DataValidationError("too long room name")
	}

	if room.Members == nil {
		return errors.DataValidationError("room members is nil")
	}

	if room.Channels == nil {
		return errors.DataValidationError("room channels is nil")
	}

	if len(room.Channels) > max_channels_count {
		return errors.DataValidationError("too many channels")
	}

	for _, channel := range room.Channels {
		if len([]rune(channel.ChannelName)) > max_str_length {
			return errors.DataValidationError("too long channel name")
		}

		if len([]rune(channel.JoinLink)) > max_str_length {
			return errors.DataValidationError("too long joinlink")
		}
	}

	for _, member := range room.Members {
		if member.Role != "admin" && member.Role != "member" {
			return errors.DataValidationError("unknown member role")
		}
	}

	return nil
}
