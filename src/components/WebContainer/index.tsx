import React, { useEffect, useRef } from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { styles } from './styles';

interface WebContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const numStars = 150;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random(),
      });
    }

    let animationFrameId: number;

    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        star.y -= star.speed;

        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // @ts-ignore
  return <canvas ref={canvasRef} style={styles.canvas} />;
};

export const WebContainer = ({ children, style }: WebContainerProps) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBackground}>
        <StarryBackground />

        <View style={[styles.webContainer, style]}>{children}</View>
      </View>
    );
  }

  return <View style={[styles.mobileContainer, style]}>{children}</View>;
};
