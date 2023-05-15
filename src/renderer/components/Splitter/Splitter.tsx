import React, { PropsWithChildren } from 'react';
import './styles.css';

function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection()?.empty) {
      window.getSelection()?.empty();
    } else if (window.getSelection()?.removeAllRanges) {
      window.getSelection()?.removeAllRanges();
    }
  }
}

const DEFAULT_SPLITTER_SIZE = 4;

interface SplitterLayoutProps {
  secondaryInitialSize?: number;
  vertical?: boolean;
  onSecondaryPaneSizeChange?: (size?: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  primaryIndex?: number;
  percentage?: boolean;
  primaryMinSize?: number;
  secondaryMinSize?: number;
  customClassName?: string;
}

interface SplitterLayoutStats {
  secondaryPaneSize?: number;
  resizing: boolean;
}

class SplitterLayout extends React.Component<
  PropsWithChildren<SplitterLayoutProps>,
  SplitterLayoutStats
> {
  protected splitter: HTMLDivElement | null = null;
  protected container: HTMLDivElement | null = null;

  constructor(props: SplitterLayoutProps) {
    super(props);
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleSplitterMouseDown = this.handleSplitterMouseDown.bind(this);
    this.state = {
      secondaryPaneSize: 0,
      resizing: false,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('touchend', this.handleMouseUp);
    document.addEventListener('touchmove', this.handleTouchMove);

    let secondaryPaneSize;

    if (typeof this.props.secondaryInitialSize !== 'undefined') {
      secondaryPaneSize = this.props.secondaryInitialSize;
    } else {
      const containerRect = this.container?.getBoundingClientRect();
      let splitterRect;

      if (this.splitter) {
        splitterRect = this.splitter.getBoundingClientRect();
      } else {
        // Simulate a splitter
        splitterRect = {
          width: DEFAULT_SPLITTER_SIZE,
          height: DEFAULT_SPLITTER_SIZE,
        };
      }

      if (containerRect && splitterRect) {
        secondaryPaneSize = this.getSecondaryPaneSize(
          containerRect,
          splitterRect,
          {
            left:
              containerRect.left +
              (containerRect.width - splitterRect.width) / 2,
            top:
              containerRect.top +
              (containerRect.height - splitterRect.height) / 2,
          },
          false
        );
      }
    }

    this.setState({ secondaryPaneSize });
  }

  componentDidUpdate(
    prevProps: SplitterLayoutProps,
    prevState: SplitterLayoutStats
  ) {
    if (
      prevState.secondaryPaneSize !== this.state.secondaryPaneSize &&
      this.props.onSecondaryPaneSizeChange
    ) {
      this.props.onSecondaryPaneSizeChange(this.state.secondaryPaneSize);
    }
    if (prevState.resizing !== this.state.resizing) {
      if (this.state.resizing) {
        if (this.props.onDragStart) {
          this.props.onDragStart();
        }
      } else if (this.props.onDragEnd) {
        this.props.onDragEnd();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('touchend', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleTouchMove);
  }

  getSecondaryPaneSize(
    containerRect: DOMRect,
    splitterRect: { width: number; height: number },
    clientPosition: { left: number; top: number },
    offsetMouse: boolean
  ) {
    let totalSize;
    let splitterSize;
    let offset;
    if (this.props.vertical) {
      totalSize = containerRect.height;
      splitterSize = splitterRect.height;
      offset = clientPosition.top - containerRect.top;
    } else {
      totalSize = containerRect.width;
      splitterSize = splitterRect.width;
      offset = clientPosition.left - containerRect.left;
    }
    if (offsetMouse) {
      offset -= splitterSize / 2;
    }
    if (offset < 0) {
      offset = 0;
    } else if (offset > totalSize - splitterSize) {
      offset = totalSize - splitterSize;
    }

    let secondaryPaneSize;
    if (this.props.primaryIndex === 1) {
      secondaryPaneSize = offset;
    } else {
      secondaryPaneSize = totalSize - splitterSize - offset;
    }
    let primaryPaneSize = totalSize - splitterSize - secondaryPaneSize;
    if (this.props.percentage) {
      secondaryPaneSize = (secondaryPaneSize * 100) / totalSize;
      primaryPaneSize = (primaryPaneSize * 100) / totalSize;
      splitterSize = (splitterSize * 100) / totalSize;
      totalSize = 100;
    }

    if (primaryPaneSize < (this.props.primaryMinSize || 0)) {
      secondaryPaneSize = Math.max(
        secondaryPaneSize -
          ((this.props.primaryMinSize || 0) - primaryPaneSize),
        0
      );
    } else if (secondaryPaneSize < (this.props.secondaryMinSize || 0)) {
      secondaryPaneSize = Math.min(
        totalSize - splitterSize - (this.props.primaryMinSize || 0),
        this.props.secondaryMinSize || 0
      );
    }

    return secondaryPaneSize;
  }

  handleResize() {
    if (this.splitter && !this.props.percentage) {
      const containerRect = this.container?.getBoundingClientRect();
      const splitterRect = this.splitter?.getBoundingClientRect();

      if (containerRect && splitterRect) {
        const secondaryPaneSize = this.getSecondaryPaneSize(
          containerRect,
          splitterRect,
          {
            left: splitterRect.left,
            top: splitterRect.top,
          },
          false
        );
        this.setState({ secondaryPaneSize });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleMouseMove(e: any) {
    if (this.state.resizing) {
      const containerRect = this.container?.getBoundingClientRect();
      const splitterRect = this.splitter?.getBoundingClientRect();

      if (splitterRect && containerRect) {
        const secondaryPaneSize = this.getSecondaryPaneSize(
          containerRect,
          splitterRect,
          {
            left: e.clientX,
            top: e.clientY,
          },
          true
        );
        clearSelection();
        this.setState({ secondaryPaneSize });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleTouchMove(e: any) {
    this.handleMouseMove(e.changedTouches[0]);
  }

  handleSplitterMouseDown() {
    clearSelection();
    this.setState({ resizing: true });
  }

  handleMouseUp() {
    this.setState((prevState) =>
      prevState.resizing ? { resizing: false } : null
    );
  }

  render() {
    let containerClasses = 'splitter-layout';
    if (this.props.customClassName) {
      containerClasses += ` ${this.props.customClassName}`;
    }
    if (this.props.vertical) {
      containerClasses += ' splitter-layout-vertical';
    }
    if (this.state.resizing) {
      containerClasses += ' layout-changing';
    }

    const children = React.Children.toArray(this.props.children).slice(0, 2);
    if (children.length === 0) {
      children.push(<div />);
    }
    const wrappedChildren = [];
    const primaryIndex =
      this.props.primaryIndex !== 0 && this.props.primaryIndex !== 1
        ? 0
        : this.props.primaryIndex;
    for (let i = 0; i < children.length; ++i) {
      let primary = true;
      let size = null;
      if (children.length > 1 && i !== primaryIndex) {
        primary = false;
        size = this.state.secondaryPaneSize;
      }
      wrappedChildren.push(
        <Pane
          vertical={this.props.vertical}
          percentage={this.props.percentage}
          primary={primary}
          size={size}
        >
          {children[i]}
        </Pane>
      );
    }

    return (
      <div
        className={containerClasses}
        ref={(c) => {
          this.container = c;
        }}
      >
        {wrappedChildren[0]}
        {wrappedChildren.length > 1 && (
          <div
            role="separator"
            className="layout-splitter"
            ref={(c) => {
              this.splitter = c;
            }}
            onMouseDown={this.handleSplitterMouseDown}
            onTouchStart={this.handleSplitterMouseDown}
          />
        )}
        {wrappedChildren.length > 1 && wrappedChildren[1]}
      </div>
    );
  }
}

function Pane(
  props: PropsWithChildren<{
    primary: boolean;
    vertical?: boolean;
    size?: number | null;
    percentage?: boolean;
  }>
) {
  const size = props.size || 0;
  const unit = props.percentage ? '%' : 'px';
  let classes = 'layout-pane';

  const style: { height?: string; width?: string } = {};

  if (!props.primary) {
    if (props.vertical) {
      style.height = `${size}${unit}`;
    } else {
      style.width = `${size}${unit}`;
    }
  } else {
    classes += ' layout-pane-primary';
  }
  return (
    <div className={classes} style={style}>
      {props.children}
    </div>
  );
}

export default SplitterLayout;
