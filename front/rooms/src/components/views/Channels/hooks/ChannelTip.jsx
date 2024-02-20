import { useState, useEffect } from 'react';

const useChannelTip = (channelIndex) => {
  const [isTipShown, setTipShown] = useState(channelIndex === 0);

  useEffect(() => {
    const tipCounterKey = 'tipCounter';
    let counter = localStorage.getItem(tipCounterKey);

    if (counter === null) {
      localStorage.setItem(tipCounterKey, '1');
      return;
    }

    let counterVal = JSON.parse(counter);
    if (counterVal > 3) {
      setTipShown(false);
    }

    localStorage.setItem(tipCounterKey, JSON.stringify(counterVal + 1));
  }, [channelIndex]);

  return { isTipShown, setTipShown };
};

export default useChannelTip;
