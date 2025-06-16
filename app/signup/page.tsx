"use client";
import SignupForm from '@/components/signup-form';
import { handleSignUp } from '../firebase/auth-service';

export default function SignupPage() {
    return <SignupForm onSignUp={handleSignUp} heading='Signup'/>;
}