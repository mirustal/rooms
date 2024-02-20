package connectroom

import (
	"fmt"
	"sync"
	"time"
)

const lockDuration = time.Second * 20

type lockChannelHandlerData struct {
	lockTimes sync.Map
}

func newLockChannelHandlerData() *lockChannelHandlerData {
	return &lockChannelHandlerData{
		lockTimes: sync.Map{},
	}
}

func isLockTimeoutFinished(lockTime time.Time) bool {
	timeoutFinishTime := lockTime.Add(lockDuration)
	return time.Now().After(timeoutFinishTime)
}

func (h *clientEventsHandler) handleLockChannel(source *roomUser, channelId int) error {
	var state *channelState
	if channel, ok := h.channels[channelId]; ok {
		state = channel
	} else {
		return fmt.Errorf("could not find channel with id %v", channelId)
	}

	locker := state.locker
	locker.Lock()
	defer locker.Unlock()

	if locker.user != nil {
		return source.writeEvent(newLockResultEvent(false))
	}

	if lockTimeRaw, ok := state.lockChannelData.lockTimes.Load(source.id); ok {
		if !isLockTimeoutFinished(lockTimeRaw.(time.Time)) {
			return source.writeEvent(newLockResultEvent(false))
		}
	}
	locker.user = source

	go h.unlockChannelAfterTimeout(channelId, lockDuration)

	err := source.writeEvent(newLockResultEvent(true))
	if err != nil {
		return err
	}

	h.roomHolder.publish(newChannelUpdatedEvent(channelId, *state))

	return nil
}

func (h *clientEventsHandler) unlockChannelAfterTimeout(channelId int, duration time.Duration) {
	time.Sleep(duration)
	state, ok := h.channels[channelId]
	if !ok {
		return
	}
	state.locker.Lock()
	defer state.locker.Unlock()
	if state.locker.user != nil {
		state.locker.user = nil
		h.roomHolder.publish(newChannelUpdatedEvent(channelId, *state))
	}
}
