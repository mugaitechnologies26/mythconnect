import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandColors } from '../theme';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'compact';
  showTagline?: boolean;
  lightText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = true,
  lightText = false 
}) => {
  const isCompact = size === 'compact';
  const emblemSize = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 48 : 34;

  return (
    <View style={styles.container}>
      {/* Brand Vector Emblem */}
      <View style={[styles.emblemContainer, { width: emblemSize, height: emblemSize }]}>
        <svg
          width={emblemSize}
          height={emblemSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Background Accent Ring */}
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          
          {/* 4 Brand AI Nodes & Interconnected Flow Channels */}
          {/* Top-Left: Primary Blue (#1565E8) */}
          <path
            d="M32 26C38 26 44 32 44 38C44 44 38 48 32 48C26 48 20 44 20 38C20 32 26 26 32 26Z"
            fill={BrandColors.blue}
          />
          {/* Top-Right: Red Accent (#EF1D2D) */}
          <path
            d="M68 26C74 26 80 32 80 38C80 44 74 48 68 48C62 48 56 44 56 38C56 32 62 26 68 26Z"
            fill={BrandColors.red}
          />
          {/* Bottom-Right: Green Accent (#00A86B) */}
          <path
            d="M68 62C74 62 80 68 80 74C80 80 74 84 68 84C62 84 56 80 56 74C56 68 62 62 68 62Z"
            fill={BrandColors.green}
          />
          {/* Bottom-Left: Orange Accent (#F5A000) */}
          <path
            d="M32 62C38 62 44 68 44 74C44 80 38 84 32 84C26 84 20 80 20 74C20 68 26 62 32 62Z"
            fill={BrandColors.orange}
          />

          {/* Central Connecting Neural Arcs */}
          <path
            d="M32 38 Q 50 50 68 38"
            stroke={BrandColors.darkNavy}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M32 74 Q 50 50 68 74"
            stroke={BrandColors.darkNavy}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M32 38 Q 50 50 32 74"
            stroke={BrandColors.darkNavy}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M68 38 Q 50 50 68 74"
            stroke={BrandColors.darkNavy}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Central AI Core Nexus */}
          <circle cx="50" cy="50" r="7" fill={BrandColors.darkNavy} stroke="#FFFFFF" strokeWidth="2.5" />
        </svg>
      </View>

      {/* Brand Typography */}
      {!isCompact && (
        <View style={styles.textGroup}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.brandName, 
              { 
                color: lightText ? '#FFFFFF' : BrandColors.darkNavy,
                fontSize: size === 'sm' ? 17 : size === 'lg' ? 24 : 19
              }
            ]}>
              Myth Connect
            </Text>
            <Text style={[
              styles.aiBadge, 
              { 
                fontSize: size === 'sm' ? 14 : size === 'lg' ? 20 : 16,
                color: BrandColors.blue 
              }
            ]}>
              .ai
            </Text>
          </View>

          {showTagline && size !== 'sm' && (
            <Text style={[
              styles.tagline, 
              { color: lightText ? 'rgba(255,255,255,0.7)' : BrandColors.textSecondary }
            ]}>
              CONNECT • CONVERT • AUTOMATE • SALES
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandName: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  aiBadge: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagline: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 1,
    fontFamily: "'Inter', sans-serif",
  },
});
