class BusinessModel {
  final String id;
  final String name;
  final String type; // 'lodge', 'restaurant', 'nightlife', 'guide_association'
  final String department;
  final String locationDetail;
  final String phone;
  final String priceRange; // '$', '$$', '$$$'
  final String sustainabilityBadge;
  final String description;
  final String icon;
  final bool verified;

  const BusinessModel({
    required this.id,
    required this.name,
    required this.type,
    required this.department,
    required this.locationDetail,
    required this.phone,
    this.priceRange = '\$\$',
    required this.sustainabilityBadge,
    this.description = '',
    this.icon = '🛖',
    this.verified = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'department': department,
      'locationDetail': locationDetail,
      'phone': phone,
      'priceRange': priceRange,
      'sustainabilityBadge': sustainabilityBadge,
      'description': description,
      'icon': icon,
      'verified': verified,
    };
  }

  factory BusinessModel.fromMap(Map<String, dynamic> map, String id) {
    return BusinessModel(
      id: id,
      name: map['name'] ?? '',
      type: map['type'] ?? 'lodge',
      department: map['department'] ?? '',
      locationDetail: map['locationDetail'] ?? '',
      phone: map['phone'] ?? '',
      priceRange: map['priceRange'] ?? '\$\$',
      sustainabilityBadge: map['sustainabilityBadge'] ?? '100% Comunitario',
      description: map['description'] ?? '',
      icon: map['icon'] ?? '🛖',
      verified: map['verified'] ?? true,
    );
  }
}
