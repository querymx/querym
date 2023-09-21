interface KeyMatcherProps {
  ctrl?: boolean;
  key?: string;
}

export default class KeyMatcher {
  protected key: KeyMatcherProps;

  constructor(props: KeyMatcherProps) {
    this.key = props;
  }

  match(e: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) {
    let isMatched = true;
    const isCtrlKey = e.ctrlKey || e.metaKey;

    if (this.key.ctrl && !isCtrlKey) {
      isMatched = false;
    }

    if (this.key.key && e.key !== this.key.key) {
      isMatched = false;
    }

    return isMatched;
  }

  toString() {
    const isMac = navigator.userAgent.toLowerCase().indexOf('mac') > -1;
    return [
      this.key.ctrl ? (isMac ? '⌘' : 'Ctrl') : undefined,
      this.key?.key?.toUpperCase(),
    ]
      .filter(Boolean)
      .join(' + ');
  }
}
