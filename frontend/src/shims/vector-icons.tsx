import React from 'react';
import { Text } from 'react-native';

const Icon = ({ name, size = 20, color = '#000', style, ...props }: any) => {
  return (
    <Text
      style={[
        {
          fontFamily: 'Material Icons',
          fontSize: size,
          color,
          lineHeight: size,
          userSelect: 'none',
        },
        style,
      ]}
      {...props}
    >
      {name}
    </Text>
  );
};

Icon.Button = ({ children, ...props }: any) => {
  return <button {...props}>{children}</button>;
};

export default Icon;
