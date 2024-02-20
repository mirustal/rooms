package connectroom

import "fmt"

func (h *clientEventsHandler) handlePushLink(source *roomUser, channelId int, newLink string) error {
	var state *channelState
	if channel, ok := h.channels[channelId]; ok {
		state = channel
	} else {
		return fmt.Errorf("could not find channel with id %v", channelId)
	}

	locker := state.locker
	locker.Lock()
	defer locker.Unlock()

	if locker.user == nil {
		return fmt.Errorf("can push links only to locked channels")
	}

	if locker.user != source {
		return fmt.Errorf("only locker of channel with id %v can push join link now", locker.user.id)
	}

	state.joinLink.Lock()
	defer state.joinLink.Unlock()

	locker.user = nil
	state.joinLink.value = newLink
	h.roomHolder.publish(newChannelUpdatedEvent(channelId, *state))

	return nil
}
