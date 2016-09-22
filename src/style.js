/**
 * @copyright 2015-present Prometheus Research, LLC
 * @flow
 */

import type {CSSPropertySet} from './CSSType';
import type {Stylesheet, Variant} from './Stylesheet';

import React from 'react';

import stylesheet from './Stylesheet';
import getComponentDisplayName from './getComponentDisplayName';

export type ComponentSpec = {
  displayName?: string;
  [name: string]: CSSPropertySet;
};

export default function style<T: string | ReactClass<*>>(
  Component: T,
  spec: ComponentSpec
): T {

  let {
    displayName,
    ...stylesheetSpec
  } = spec;

  if (displayName == null) {
    displayName = getComponentDisplayName(Component);
  }

  return injectStylesheet(
    Component,
    stylesheet(displayName, stylesheetSpec)
  );
}

export function injectStylesheet<T: string | ReactClass<*>>(
  Component: T,
  stylesheet: Stylesheet
): T {
  let StylesheetComponent = class extends React.Component {

    props: {
      Component: T;
      stylesheet: Stylesheet;
      variant: Variant;
      className?: string;
    };

    static defaultProps = {
      stylesheet: stylesheet,
      Component: Component,
      variant: {},
    };

    render() {
      let {
        variant,
        className: extraClassName,
        Component,
        stylesheet,
        ...props
      } = this.props;

      let className = stylesheet.toClassName(variant);
      if (extraClassName) {
        className = className + ' ' + extraClassName;
      }
      return (
        <Component
          {...props}
          className={className}
          />
      );
    }

    componentWillMount() {
      this.props.stylesheet.inject();
    }

    componentWillUnmount() {
      this.props.stylesheet.dispose();
    }

    componentWillReceiveProps(nextProps: {stylesheet: Stylesheet}) {
      if (nextProps.stylesheet !== this.props.stylesheet) {
        this.props.stylesheet.dispose();
        nextProps.stylesheet.inject();
      }
    }
  };

  return ((StylesheetComponent: any): T);
}