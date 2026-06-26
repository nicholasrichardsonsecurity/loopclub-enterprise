import 'package:flutter/material.dart';

void main() {
  runApp(const LoopClubApp());
}

class LoopClubApp extends StatelessWidget {
  const LoopClubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'LoopClub',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6F13A5)),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8F9FC),
        fontFamily: 'Roboto',
      ),
      home: const SplashPage(),
    );
  }
}

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6F13A5), Color(0xFFCF00FF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Spacer(),
                Container(
                  height: 82,
                  width: 82,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(.16),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: Colors.white.withOpacity(.24)),
                  ),
                  child: const Icon(Icons.all_inclusive_rounded, size: 46, color: Colors.white),
                ),
                const SizedBox(height: 28),
                const Text(
                  'LoopClub',
                  style: TextStyle(color: Colors.white, fontSize: 42, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 10),
                const Text(
                  'A plataforma que faz seus clientes voltarem.',
                  style: TextStyle(color: Colors.white70, fontSize: 18, height: 1.35),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF6F13A5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginPage())),
                    child: const Text('Começar', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 28),
              const Text('Entre no LoopClub', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              const Text('Use telefone ou e-mail para acessar sua carteira de fidelidade.', style: TextStyle(fontSize: 16, color: Color(0xFF64748B))),
              const SizedBox(height: 32),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Telefone ou e-mail',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 58,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: const Color(0xFF6F13A5), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ClientHomePage())),
                  child: const Text('Continuar', style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ClientHomePage extends StatelessWidget {
  const ClientHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Minha carteira'), backgroundColor: Colors.transparent),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: const [
          Text('Olá, Nicholas 👋', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
          SizedBox(height: 8),
          Text('Seus cartões de fidelidade em um só lugar.', style: TextStyle(color: Color(0xFF64748B))),
          SizedBox(height: 24),
          LoyaltyCard(company: 'Açaí Modelo', program: 'Compre 10, ganhe 1', progress: 0.6, points: '6/10'),
          LoyaltyCard(company: 'Barbearia Prime', program: 'Corte 8x', progress: 0.375, points: '3/8'),
          LoyaltyCard(company: 'Restaurante Central', program: 'Almoço fidelidade', progress: 0.8, points: '8/10'),
        ],
      ),
    );
  }
}

class LoyaltyCard extends StatelessWidget {
  final String company;
  final String program;
  final double progress;
  final String points;

  const LoyaltyCard({super.key, required this.company, required this.program, required this.progress, required this.points});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 24, offset: Offset(0, 10))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 48, height: 48, decoration: BoxDecoration(color: const Color(0xFF6F13A5).withOpacity(.1), borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.storefront, color: Color(0xFF6F13A5))),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(company, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), Text(program, style: const TextStyle(color: Color(0xFF64748B)))])),
          Text(points, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF6F13A5))),
        ]),
        const SizedBox(height: 18),
        ClipRRect(borderRadius: BorderRadius.circular(999), child: LinearProgressIndicator(value: progress, minHeight: 10, backgroundColor: const Color(0xFFE5E7EB), color: const Color(0xFF6F13A5))),
      ]),
    );
  }
}
