import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  landingForm!: FormGroup;
  
  year = new Date().getFullYear(); 

  constructor(
    private fb: FormBuilder,
    private router: Router 
  ) {
    this.landingForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  login() {
    this.router.navigate(['/login'])
  }
  getStarted(){
    this.router.navigate(['/signup']),{
      queryParams: {email: this.landingForm.value.email}
    }
  }

  reasons = [
    {
      title: 'Enjoy on your TV',
      text: 'Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.',
      icon: 'tv'
    },
    {
      title: 'Download your shows to watch offline',
      text: 'Save your favorites easily and always have something to watch.',
      icon: 'download_for_offline' 
    },
    {
      title: 'Watch everywhere',
      text: 'Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.',
      icon: 'devices'
    },
    {
      title: 'Create profiles for kids',
      text: 'Send kids on adventures with their favorite characters in a space made just for them—free with your membership.',
      icon: 'child_care'
    }
  ];
  faqs = [
    {
      question: 'What is PulseScreen?',
      answer: 'PulseScreen is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want without a single commercial – all for one low monthly price.'
    },
    {
      question: 'How much does PulseScreen cost?',
      answer: 'Watch PulseScreen on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $9.99 to $19.99 a month. No extra costs, no contracts.'
    },
    {
      question: 'Where can I watch?',
      answer: 'Watch anywhere, anytime. Sign in with your PulseScreen account to watch instantly on the web at pulsescreen.com from your personal computer or on any internet-connected device that offers the PulseScreen app, including smart TVs, smartphones, tablets, streaming media players and game consoles.'
    },
    {
      question: 'How do I cancel?',
      answer: 'PulseScreen is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime.'
    },
    {
      question: 'What can I watch on PulseScreen?',
      answer: 'PulseScreen has an extensive library of feature films, documentaries, TV shows, anime, award-winning PulseScreen originals, and more. Watch as much as you want, anytime you want.'
    },
    {
      question: 'Is PulseScreen good for kids?',
      answer: 'The PulseScreen Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space.'
    }
  ];
}